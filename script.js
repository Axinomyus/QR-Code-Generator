(function ()
{
    'use strict';

    const form            = document.getElementById('qr-form');
    const fields          = form.elements;
    const qrCanvas        = document.getElementById('qrious');
    const emptyPreview    = document.getElementById('empty-preview');
    const previewStatus   = document.getElementById('preview-status');
    const contentError    = document.getElementById('content-error');
    const settingsError   = document.getElementById('settings-error');
    const downloadButton  = document.getElementById('download');
    const cardButton      = document.getElementById('download-card');
    const copyButton      = document.getElementById('copy-qr');
    const svgButton       = document.getElementById('download-svg');
    const actionStatus    = document.getElementById('action-status');
    const paletteButtons  = document.querySelectorAll('[data-palette]');
    const translate       = window.QrI18n.translate;
    const cardPreview     = document.getElementById('qrImgContainer');
    const previewFit      = document.getElementById('preview-fit');
    const previewStage    = document.querySelector('.preview-stage');
    const surfaceError    = document.getElementById('qr-surface-error');
    const sizeSliders     = document.querySelectorAll('[data-size-slider]');
    const watermarkLogo   = document.getElementById('watermark-logo');
    const surfaceLink     = document.getElementById('link-surface-dimensions');

    const palettes = {
        lime: { name: 'paletteLime', foreground: '#17251b', background: '#e2f6c5' },
        classic: { name: 'paletteClassic', foreground: '#111111', background: '#ffffff' },
        lavender: { name: 'paletteLavender', foreground: '#30234d', background: '#e4dcff' },
        ice: { name: 'paletteIce', foreground: '#153644', background: '#d1f3ff' }
    };

    const formats = {
        png: { label: 'PNG', mime: 'image/png', extension: 'png' },
        jpeg: { label: 'JPEG', mime: 'image/jpeg', extension: 'jpg' },
        webp: { label: 'WebP', mime: 'image/webp', extension: 'webp' }
    };

    // Byte-mode capacities of the bundled encoder at QR version 40.
    const capacities = { L: 2953, M: 2331, Q: 1663, H: 1273 };

    let qr             = null;
    let exportReady    = false;
    let exporting      = false;
    let paletteName    = 'paletteLime';
    let destination    = '';
    let copying        = false;
    let actionRevision = 0;
    let surfaceReady   = true;

    if (window.location.protocol == 'chrome-extension:')
    {
        document.body.classList.add('extension-popup');
    }

    function setError(element, message)
    {
        element.textContent = message;
        element.hidden      = message.length == 0;
    }

    function updateButtons()
    {
        downloadButton.disabled = !exportReady || exporting || copying;
        cardButton.disabled     = !exportReady || exporting || copying || !surfaceReady || !window.QrCardBackground.isReady();
        copyButton.disabled     = !exportReady || exporting || copying;
        svgButton.disabled      = !exportReady || exporting || copying;
    }

    function setPreviewReady(ready)
    {
        exportReady         = ready;
        qrCanvas.hidden     = !ready;
        emptyPreview.hidden = ready;
        previewStatus.textContent = translate('waiting');

        if (ready)
        {
            previewStatus.textContent = translate('ready');
        }

        updateButtons();
    }

    function getCardText()
    {
        return {
            title: fields.title.value.trim() || translate('defaultTitle'),
            caption: fields.caption.value.trim() || translate('defaultCaption')
        };
    }

    function updateCardText()
    {
        const cardText = getCardText();

        document.getElementById('preview-title').textContent       = cardText.title;
        document.getElementById('preview-caption').textContent     = cardText.caption;
        document.getElementById('preview-destination').textContent = getCardFooterText();
        updateCardPreview();
    }

    function getCardFooterText()
    {
        return fields.footerText.value.trim() || destination || translate('madeToShare');
    }

    function getBackgroundAlpha()
    {
        if (fields.format.value == 'jpeg')
        {
            return 1;
        }

        if (fields.transparent.checked)
        {
            return 0;
        }

        return Number(fields.backgroundAlpha.value);
    }

    function validateSurface()
    {
        surfaceReady = true;
        setError(surfaceError, '');

        for (const input of [fields.qrSurfaceWidth, fields.qrSurfaceHeight])
        {
            input.removeAttribute('aria-invalid');

            if (!input.validity.valid)
            {
                surfaceReady = false;
                input.setAttribute('aria-invalid', 'true');
                setError(surfaceError, translate('qrSurfaceInvalid', { min: input.min, max: input.max }));
            }
        }
    }

    function synchronizeDimensions(changedField)
    {
        let size = Number(fields.size.value);

        if (changedField == 'size')
        {
            for (const input of [fields.qrSurfaceWidth, fields.qrSurfaceHeight])
            {
                input.value = String(Math.max(Number(input.value), size));
            }
        }
        else
        {
            size = Math.min(size, Number(fields.qrSurfaceWidth.value), Number(fields.qrSurfaceHeight.value));
            fields.size.value = String(size);
        }

        // Keep room for the full QR even when the user shrinks a design with extra margin.
        const maximumMargin = Math.max(0, Math.floor((size - 177) / 2) - Math.ceil(size * 4 / 29));

        fields.padding.value = String(Math.min(Number(fields.padding.value), maximumMargin));
    }

    function fitCardPreview()
    {
        const style  = getComputedStyle(previewStage);
        const width  = previewStage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const height = previewStage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        let scale    = Math.max(0, Math.min(1, width / cardPreview.offsetWidth));

        if (!document.body.classList.contains('extension-popup'))
        {
            scale = Math.min(scale, Math.max(0, height / cardPreview.offsetHeight));
        }

        cardPreview.style.transform = 'scale(' + scale + ')';
        previewFit.style.width      = cardPreview.offsetWidth * scale + 'px';
        previewFit.style.height     = cardPreview.offsetHeight * scale + 'px';
    }

    function updateCardPreview()
    {
        const layout = getCardLayout();
        const values = { width: layout.width, height: layout.height, font: layout.fontSize, captionFont: layout.captionFont, captionLine: layout.captionLine, footerFont: layout.footerFont, watermarkFont: layout.watermarkFont, logoSize: layout.logoSize, logoGap: layout.logoGap, qr: layout.qrSize, surfaceWidth: layout.surfaceWidth, surfaceHeight: layout.surfaceHeight, qrTop: layout.qrTop, captionTop: layout.captionTop, divider: layout.dividerY };

        cardPreview.style.setProperty('--card-unit', 340 / layout.width + 'px');

        for (const [name, value] of Object.entries(values))
        {
            cardPreview.style.setProperty('--layout-' + name, String(value));
        }

        document.getElementById('preview-title').textContent   = layout.titleLines.join('\n');
        document.getElementById('preview-caption').textContent = layout.captionLines.join('\n');

        const alpha    = getBackgroundAlpha();
        const channels = getColorChannels(fields.background.value).map(function (channel)
        {
            return Math.round((channel * alpha + 1 - alpha) * 255);
        });

        document.getElementById('qr-frame').style.background = 'rgb(' + channels.join(',') + ')';
        fitCardPreview();
    }

    function updateExportOptions()
    {
        const isJpeg = fields.format.value == 'jpeg';
        const hint   = document.getElementById('transparency-hint');

        fields.transparent.disabled     = isJpeg;
        fields.backgroundAlpha.disabled = isJpeg || fields.transparent.checked;
        hint.textContent                = translate('transparencyHint');
        document.getElementById('preview-watermark').hidden = !fields.watermark.checked;

        if (isJpeg)
        {
            hint.textContent = translate('jpegHint');
        }

        document.getElementById('qr-frame').classList.toggle('transparent-preview', getBackgroundAlpha() < 1);
    }

    function getColorChannels(color)
    {
        return [1, 3, 5].map(function (offset)
        {
            return parseInt(color.slice(offset, offset + 2), 16) / 255;
        });
    }

    function getLuminance(channels)
    {
        const linear = channels.map(function (channel)
        {
            if (channel <= 0.04045)
            {
                return channel / 12.92;
            }

            return Math.pow((channel + 0.055) / 1.055, 2.4);
        });

        return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    }

    function hasReadableColors()
    {
        const backgroundAlpha = getBackgroundAlpha();
        const foregroundAlpha = Number(fields.foregroundAlpha.value);
        const paper           = getColorChannels(fields.background.value).map(function (channel)
        {
            return channel * backgroundAlpha + 1 - backgroundAlpha;
        });
        const ink = getColorChannels(fields.foreground.value).map(function (channel, index)
        {
            return channel * foregroundAlpha + paper[index] * (1 - foregroundAlpha);
        });

        return (getLuminance(paper) + 0.05) / (getLuminance(ink) + 0.05) >= 3;
    }

    function readSettings()
    {
        const numericFields = ['size', 'padding', 'foregroundAlpha', 'backgroundAlpha'];

        for (const name of numericFields)
        {
            const input = fields[name];

            input.removeAttribute('aria-invalid');

            if (input.disabled)
            {
                continue;
            }

            if (!input.validity.valid)
            {
                input.setAttribute('aria-invalid', 'true');
                const label = form.querySelector('label[for="' + input.id + '"]').textContent;

                setError(settingsError, translate('invalidNumber', { field: label, min: input.min, max: input.max, step: input.step }));
                return null;
            }
        }

        const size    = Number(fields.size.value);
        const padding = Math.ceil(size * 4 / 29) + Number(fields.padding.value);

        // Reserve four modules even for the smallest symbol, and room for version 40.
        if (size - padding * 2 < 177)
        {
            setError(settingsError, translate('marginError'));
            return null;
        }

        if (!hasReadableColors())
        {
            setError(settingsError, translate('contrastError'));
            return null;
        }

        return {
            size: size,
            padding: padding,
            level: fields.level.value,
            foreground: fields.foreground.value,
            background: fields.background.value,
            foregroundAlpha: Number(fields.foregroundAlpha.value),
            backgroundAlpha: getBackgroundAlpha()
        };
    }

    function updateAppearance()
    {
        document.documentElement.style.setProperty('--qr-paper', fields.background.value);
        document.getElementById('foreground-value').textContent = fields.foreground.value.toUpperCase();
        document.getElementById('background-value').textContent = fields.background.value.toUpperCase();
        document.getElementById('palette-name').textContent     = translate(paletteName);
        surfaceLink.setAttribute('aria-pressed', String(fields.qrSurfaceLinked.checked));

        for (const input of sizeSliders)
        {
            const progress = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100;

            document.getElementById(input.id + '-value').value = input.value + ' px';
            input.style.setProperty('--range-progress', progress + '%');
            input.setAttribute('aria-valuetext', input.value + ' px');
        }
    }

    function renderQr()
    {
        actionRevision++;
        setError(contentError, '');
        setError(settingsError, '');
        actionStatus.textContent = '';
        setPreviewReady(false);
        updateExportOptions();
        updateAppearance();
        validateSurface();

        const content = window.QrContent.read();

        destination = content.destination || '';
        updateCardText();

        if (content.error)
        {
            content.field.setAttribute('aria-invalid', 'true');
            setError(contentError, translate(content.error));
            previewStatus.textContent = translate('checkContent');
            return;
        }

        const settings = readSettings();

        if (!settings)
        {
            previewStatus.textContent = translate('checkSettings');
            return;
        }

        const format = formats[fields.format.value];

        document.getElementById('export-details').textContent = translate('exportDetails', { format: format.label, width: settings.size, height: settings.size });

        if (!content.value)
        {
            return;
        }

        const bytes    = new TextEncoder().encode(content.value);
        const capacity = capacities[settings.level];

        if (bytes.length > capacity)
        {
            content.field.setAttribute('aria-invalid', 'true');
            setError(contentError, translate('contentTooLong', { bytes: bytes.length, capacity: capacity }));
            previewStatus.textContent = translate('shorten');
            return;
        }

        // QRious accepts a byte string, so encode Unicode before passing the content in.
        settings.value = Array.from(bytes, function (byte)
        {
            return String.fromCharCode(byte);
        }).join('');

        try
        {
            if (!qr)
            {
                qr        = new QRious(Object.assign({ element: qrCanvas }, settings));
                window.qr = qr;
            }
            else
            {
                qr.set(settings);
            }

            setPreviewReady(true);
        }
        catch (error)
        {
            console.error('QR generation failed.', error);
            setError(settingsError, translate('generationError'));
            previewStatus.textContent = translate('generationFailed');
        }
    }

    function selectPalette(name)
    {
        const palette = palettes[name];

        fields.foreground.value      = palette.foreground;
        fields.background.value      = palette.background;
        fields.foregroundAlpha.value = '1';
        fields.backgroundAlpha.value = '1';
        paletteName = palette.name;

        for (const button of paletteButtons)
        {
            button.setAttribute('aria-pressed', String(button.dataset.palette == name));
        }

        renderQr();
        document.dispatchEvent(new Event('designchange'));
    }

    function wrapText(context, text, maxWidth)
    {
        const lines = [];

        for (const paragraph of text.split('\n'))
        {
            let line = '';

            for (const word of paragraph.split(/\s+/))
            {
                let candidate = word;

                if (line)
                {
                    candidate = line + ' ' + word;
                }

                if (line && context.measureText(candidate).width > maxWidth)
                {
                    lines.push(line);
                    line = '';
                }

                if (line)
                {
                    line += ' ';
                }

                for (const character of word)
                {
                    if (line && context.measureText(line + character).width > maxWidth)
                    {
                        lines.push(line);
                        line = '';
                    }

                    line += character;
                }
            }

            lines.push(line);
        }

        return lines;
    }

    function createCardQrCanvas(size)
    {
        if (size == qr.size)
        {
            return qrCanvas;
        }

        // Re-encode at the target resolution so dense QR modules survive shrinking.
        const padding = Math.min(Math.ceil(qr.padding * size / qr.size), Math.floor((size - 177) / 2));
        const cardQr  = new QRious({ size: size, padding: padding, value: qr.value, level: qr.level, foreground: qr.foreground, background: qr.background, foregroundAlpha: qr.foregroundAlpha, backgroundAlpha: qr.backgroundAlpha });

        return cardQr.canvas;
    }

    function createCardCanvas()
    {
        const canvas  = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const layout  = getCardLayout();
        const { qrSize, surfaceWidth, surfaceHeight, width, height, fontSize, captionFont, captionLine, footerFont, watermarkFont, logoSize, logoGap, titleLines, captionLines, qrTop, captionTop, dividerY } = layout;

        canvas.width  = width;
        canvas.height = height;

        const colors = window.QrCardBackground.getTextColors();

        context.save();
        context.beginPath();
        context.roundRect(0, 0, width, height, 52);
        context.clip();
        window.QrCardBackground.draw(context, width, height);
        context.restore();

        context.strokeStyle = colors.border;
        context.lineWidth   = 2;
        context.beginPath();
        context.roundRect(2, 2, width - 4, height - 4, 50);
        context.stroke();

        context.fillStyle = colors.text;
        context.font      = '22px "Segoe UI", Arial, sans-serif';
        context.fillText(translate('scanConnect'), 62, 75, width - 180);
        context.font = '38px "Segoe UI", Arial, sans-serif';
        context.fillText('↗', width - 96, 79);

        context.textAlign = 'center';
        context.fillStyle = colors.title;
        context.font      = '500 ' + fontSize + 'px "Segoe UI", Arial, sans-serif';
        context.textBaseline = 'top';

        for (let index = 0; index < titleLines.length; index++)
        {
            context.fillText(titleLines[index], width / 2, 138 + index * fontSize * 1.17);
        }

        const surfaceLeft = (width - surfaceWidth) / 2;
        const qrLeft      = Math.round((width - qrSize) / 2);
        const qrY         = Math.round(qrTop + (surfaceHeight - qrSize) / 2);

        context.save();
        context.beginPath();
        context.roundRect(surfaceLeft, qrTop, surfaceWidth, surfaceHeight, 32);
        context.clip();
        context.fillStyle = '#ffffff';
        context.fillRect(surfaceLeft, qrTop, surfaceWidth, surfaceHeight);
        context.fillStyle   = fields.background.value;
        context.globalAlpha = getBackgroundAlpha();
        context.fillRect(surfaceLeft, qrTop, surfaceWidth, surfaceHeight);
        context.globalAlpha = 1;
        // Keep translucent QR pixels on the same white scanning surface as its surround.
        context.fillStyle = '#ffffff';
        context.fillRect(qrLeft, qrY, qrSize, qrSize);
        context.imageSmoothingEnabled = false;
        context.drawImage(createCardQrCanvas(qrSize), qrLeft, qrY);
        context.restore();

        context.fillStyle = colors.muted;
        context.font      = captionFont + 'px "Segoe UI", Arial, sans-serif';

        for (let index = 0; index < captionLines.length; index++)
        {
            context.fillText(captionLines[index], width / 2, captionTop + index * captionLine);
        }

        context.textBaseline = 'alphabetic';
        context.strokeStyle = colors.border;
        context.setLineDash([9, 10]);
        context.beginPath();
        context.moveTo(0, dividerY);
        context.lineTo(width, dividerY);
        context.stroke();
        context.setLineDash([]);

        context.globalCompositeOperation = 'destination-out';

        for (const x of [0, width])
        {
            context.beginPath();
            context.arc(x, dividerY, 20, 0, Math.PI * 2);
            context.fill();
        }

        context.globalCompositeOperation = 'source-over';
        context.textAlign = 'left';
        context.fillStyle = colors.text;
        context.font      = footerFont + 'px "Segoe UI", Arial, sans-serif';
        const expiryText  = '∞  ' + translate('noExpiry');
        const expiryWidth = context.measureText(expiryText).width;

        context.fillText(expiryText, 62, dividerY + footerFont * 1.5);

        const destinationWidth = Math.max(60, width - expiryWidth - 156);
        let destinationText    = getCardFooterText();

        if (context.measureText(destinationText).width > destinationWidth)
        {
            while (destinationText.length && context.measureText(destinationText + '…').width > destinationWidth)
            {
                destinationText = destinationText.slice(0, -1);
            }

            destinationText += '…';
        }

        context.textAlign = 'right';
        context.fillStyle = colors.muted;
        context.fillText(destinationText, width - 62, dividerY + footerFont * 1.5);

        if (fields.watermark.checked)
        {
            const logoHeight = logoSize * watermarkLogo.naturalHeight / watermarkLogo.naturalWidth;
            const logoTop    = dividerY + footerFont * 2.1;

            context.drawImage(watermarkLogo, (width - logoSize) / 2, logoTop + (logoSize - logoHeight) / 2, logoSize, logoHeight);
            context.textAlign = 'center';
            context.font      = watermarkFont + 'px "Segoe UI", Arial, sans-serif';
            context.fillText(translate('brandBy'), width / 2, logoTop + logoSize + logoGap + watermarkFont, width - 124);
        }

        return canvas;
    }

    function getCardLayout()
    {
        const context  = document.createElement('canvas').getContext('2d');
        const cardText = getCardText();
        let qrSize     = Number(fields.size.value);

        if (!fields.size.validity.valid)
        {
            qrSize = Number(fields.size.defaultValue);
        }

        let surfaceWidth  = Number(fields.qrSurfaceWidth.defaultValue);
        let surfaceHeight = Number(fields.qrSurfaceHeight.defaultValue);

        if (surfaceReady)
        {
            surfaceWidth  = Number(fields.qrSurfaceWidth.value);
            surfaceHeight = Number(fields.qrSurfaceHeight.value);
        }

        const width         = Math.max(1240, surfaceWidth + 240);
        const fontSize      = Math.max(38, Math.round(width * 0.062));
        const captionFont   = Math.round(width * 0.044);
        const captionLine   = Math.ceil(captionFont * 1.4);
        const footerFont    = Math.round(width * 0.04);
        const watermarkFont = Math.round(width * 0.036);
        const logoSize      = Math.round(width * 0.085);
        const logoGap       = Math.round(watermarkFont * 0.35);

        qrSize = Math.min(qrSize, surfaceWidth, surfaceHeight);

        context.font = '500 ' + fontSize + 'px "Segoe UI", Arial, sans-serif';
        const titleLines = wrapText(context, cardText.title, width - 180);

        context.font = captionFont + 'px "Segoe UI", Arial, sans-serif';
        const captionLines = wrapText(context, cardText.caption, width - 200);
        const titleHeight  = titleLines.length * fontSize * 1.17;
        const naturalQrTop = 188 + titleHeight;
        const contentEnd   = naturalQrTop + surfaceHeight + 100 + captionLines.length * captionLine;

        let watermarkHeight = 0;

        if (fields.watermark.checked)
        {
            watermarkHeight = logoSize + logoGap + watermarkFont * 1.6;
        }

        const footerHeight = Math.ceil(footerFont * 2.4 + watermarkHeight);
        const height       = Math.ceil(Math.max(width * 1.5, contentEnd + footerHeight));
        const extraSpace   = height - contentEnd - footerHeight;
        const qrTop        = naturalQrTop + Math.round(extraSpace * 0.45);
        const captionTop   = qrTop + surfaceHeight + 45;
        const dividerY     = height - footerHeight;

        return { qrSize, surfaceWidth, surfaceHeight, width, height, fontSize, captionFont, captionLine, footerFont, watermarkFont, logoSize, logoGap, titleLines, captionLines, qrTop, captionTop, dividerY };
    }

    function flattenCanvas(canvas)
    {
        const flattened = document.createElement('canvas');
        const context   = flattened.getContext('2d');

        flattened.width   = canvas.width;
        flattened.height  = canvas.height;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, flattened.width, flattened.height);
        context.drawImage(canvas, 0, 0);

        return flattened;
    }

    function saveDownload(image, prefix, extension)
    {
        const link      = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        link.href     = image;
        link.download = prefix + '-Axinomyus-' + timestamp + '.' + extension;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function exportSvg()
    {
        if (!exportReady || exporting || copying)
        {
            return;
        }

        try
        {
            const svg = window.QrSvg.create(qr);

            saveDownload('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), 'qr-code', 'svg');
            actionStatus.textContent = translate('downloadReady', { format: 'SVG' });
        }
        catch (error)
        {
            console.error('QR vector export failed.', error);
            actionStatus.textContent = translate('svgError');
        }
    }

    async function copyQr()
    {
        if (!exportReady || exporting || copying)
        {
            return;
        }

        if (!navigator.clipboard || typeof navigator.clipboard.write != 'function' || typeof ClipboardItem == 'undefined')
        {
            actionStatus.textContent = translate('copyUnavailable');
            return;
        }

        const revision = actionRevision;

        copying = true;
        updateButtons();
        actionStatus.textContent = translate('copyingQr');

        try
        {
            const image = new Promise(function (resolve, reject)
            {
                qrCanvas.toBlob(function (blob)
                {
                    if (!blob)
                    {
                        reject(new Error('The QR image could not be encoded as PNG.'));
                        return;
                    }

                    resolve(blob);
                }, 'image/png');
            });

            await navigator.clipboard.write([new ClipboardItem({ 'image/png': image })]);

            if (revision == actionRevision)
            {
                actionStatus.textContent = translate('qrCopied');
            }
        }
        catch (error)
        {
            console.warn('Copying the QR image failed.', error);

            if (revision == actionRevision)
            {
                actionStatus.textContent = translate('copyFailed');
            }
        }
        finally
        {
            copying = false;
            updateButtons();
        }
    }

    async function exportImage(card)
    {
        if (!exportReady || exporting)
        {
            return;
        }

        if (card && (!surfaceReady || !window.QrCardBackground.isReady()))
        {
            return;
        }

        exporting = true;
        updateButtons();
        const format = formats[fields.format.value];

        actionStatus.textContent = translate('preparing', { format: format.label });

        try
        {
            let canvas = qrCanvas;
            let prefix = 'qr-code';

            if (card)
            {
                if (fields.watermark.checked)
                {
                    await watermarkLogo.decode();
                }

                canvas = createCardCanvas();
                prefix = 'qr-card';
            }

            if (fields.format.value == 'jpeg')
            {
                canvas = flattenCanvas(canvas);
            }

            const image = canvas.toDataURL(format.mime, 0.95);

            if (!image.startsWith('data:' + format.mime + ';'))
            {
                throw new Error('The selected image format is unavailable in this browser.');
            }

            saveDownload(image, prefix, format.extension);
            actionStatus.textContent = translate('downloadReady', { format: format.label });
        }
        catch (error)
        {
            console.error('QR image export failed.', error);
            actionStatus.textContent = translate('exportError');
        }
        finally
        {
            exporting = false;
            updateButtons();
        }
    }

    form.addEventListener('submit', function (event)
    {
        event.preventDefault();
    });

    form.addEventListener('input', function (event)
    {
        if (fields.qrSurfaceLinked.checked && ['qrSurfaceWidth', 'qrSurfaceHeight'].includes(event.target.name))
        {
            fields.qrSurfaceWidth.value  = event.target.value;
            fields.qrSurfaceHeight.value = event.target.value;
        }

        if (['size', 'qrSurfaceWidth', 'qrSurfaceHeight', 'qrSurfaceLinked'].includes(event.target.name))
        {
            synchronizeDimensions(event.target.name);
        }

        if (['title', 'caption', 'footerText'].includes(event.target.name))
        {
            updateCardText();
            actionStatus.textContent = '';
            return;
        }

        if (['foreground', 'background', 'foregroundAlpha', 'backgroundAlpha'].includes(event.target.name))
        {
            for (const button of paletteButtons)
            {
                button.setAttribute('aria-pressed', 'false');
            }

            paletteName = 'paletteCustom';
        }

        renderQr();
    });

    for (const button of paletteButtons)
    {
        button.addEventListener('click', function ()
        {
            selectPalette(button.dataset.palette);
        });
    }

    surfaceLink.addEventListener('click', function ()
    {
        fields.qrSurfaceLinked.checked = !fields.qrSurfaceLinked.checked;

        if (fields.qrSurfaceLinked.checked)
        {
            fields.qrSurfaceHeight.value = fields.qrSurfaceWidth.value;
        }

        fields.qrSurfaceLinked.dispatchEvent(new Event('input', { bubbles: true }));
    });

    downloadButton.addEventListener('click', function ()
    {
        exportImage(false);
    });

    cardButton.addEventListener('click', function ()
    {
        exportImage(true);
    });

    document.addEventListener('languagechange', renderQr);
    document.addEventListener('cardbackgroundchange', function ()
    {
        actionStatus.textContent = '';
        updateButtons();
    });
    document.addEventListener('contenttypechange', renderQr);
    copyButton.addEventListener('click', copyQr);
    svgButton.addEventListener('click', exportSvg);

    function refreshDesign()
    {
        paletteName = 'paletteCustom';

        for (const button of paletteButtons)
        {
            const palette  = palettes[button.dataset.palette];
            const selected = fields.foreground.value == palette.foreground && fields.background.value == palette.background && Number(fields.foregroundAlpha.value) == 1 && Number(fields.backgroundAlpha.value) == 1;

            button.setAttribute('aria-pressed', String(selected));

            if (selected)
            {
                paletteName = palette.name;
            }
        }

        fields.wifiPassword.disabled = fields.wifiSecurity.value == 'nopass';
        document.getElementById('wifi-password-field').hidden = fields.wifiPassword.disabled;
        synchronizeDimensions();
        renderQr();
    }

    window.QrStudio = Object.freeze({ refresh: refreshDesign });
    const previewObserver = new ResizeObserver(fitCardPreview);
    previewObserver.observe(previewStage);
    previewObserver.observe(cardPreview);
    renderQr();
})();
