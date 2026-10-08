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
    const actionStatus    = document.getElementById('action-status');
    const paletteButtons  = document.querySelectorAll('[data-palette]');
    const translate       = window.QrI18n.translate;

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

    let qr          = null;
    let exportReady = false;
    let exporting   = false;
    let paletteName = 'paletteLime';
    let destination = '';

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
        downloadButton.disabled = !exportReady || exporting;
        cardButton.disabled     = !exportReady || exporting;
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
        document.getElementById('preview-destination').textContent = destination || translate('madeToShare');
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
    }

    function renderQr()
    {
        setError(contentError, '');
        setError(settingsError, '');
        actionStatus.textContent = '';
        setPreviewReady(false);
        updateExportOptions();
        updateAppearance();

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

    function fillRoundedRectangle(context, x, y, width, height, radius, fill)
    {
        context.fillStyle = fill;
        context.beginPath();
        context.roundRect(x, y, width, height, radius);
        context.fill();
    }

    function createCardCanvas()
    {
        const canvas   = document.createElement('canvas');
        const context  = canvas.getContext('2d');
        const cardText = getCardText();
        const qrSize   = qrCanvas.width;
        const width    = qrSize + 240;
        const fontSize = Math.max(38, Math.round(width * 0.062));

        context.font = '500 ' + fontSize + 'px "Segoe UI", Arial, sans-serif';
        const titleLines = wrapText(context, cardText.title, width - 180);

        context.font = '28px "Segoe UI", Arial, sans-serif';
        const captionLines = wrapText(context, cardText.caption, width - 200);
        const titleHeight  = titleLines.length * fontSize * 1.17;
        const qrTop        = 156 + titleHeight;
        const dividerY     = qrTop + qrSize + 82 + captionLines.length * 39;

        let watermarkHeight = 0;

        if (fields.watermark.checked)
        {
            watermarkHeight = 44;
        }

        canvas.width  = width;
        canvas.height = Math.ceil(dividerY + 116 + watermarkHeight);

        const background = context.createLinearGradient(0, 0, width, canvas.height);

        background.addColorStop(0, '#3d4b2a');
        background.addColorStop(1, '#182315');
        fillRoundedRectangle(context, 0, 0, width, canvas.height, 52, background);

        context.strokeStyle = '#79964f';
        context.lineWidth   = 2;
        context.beginPath();
        context.roundRect(2, 2, width - 4, canvas.height - 4, 50);
        context.stroke();

        context.fillStyle = '#c2d0ab';
        context.font      = '22px "Segoe UI", Arial, sans-serif';
        context.fillText(translate('scanConnect'), 62, 75, width - 180);
        context.font = '38px "Segoe UI", Arial, sans-serif';
        context.fillText('↗', width - 96, 79);

        context.textAlign = 'center';
        context.fillStyle = '#b1f55c';
        context.font      = '500 ' + fontSize + 'px "Segoe UI", Arial, sans-serif';

        for (let index = 0; index < titleLines.length; index++)
        {
            context.fillText(titleLines[index], width / 2, 138 + fontSize + index * fontSize * 1.17);
        }

        fillRoundedRectangle(context, 120, qrTop, qrSize, qrSize, 32, '#ffffff');
        context.save();
        context.beginPath();
        context.roundRect(120, qrTop, qrSize, qrSize, 32);
        context.clip();
        context.drawImage(qrCanvas, 120, qrTop);
        context.restore();

        context.fillStyle = '#c1cfb3';
        context.font      = '28px "Segoe UI", Arial, sans-serif';

        for (let index = 0; index < captionLines.length; index++)
        {
            context.fillText(captionLines[index], width / 2, qrTop + qrSize + 58 + index * 39);
        }

        context.strokeStyle = '#7c915d';
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
        context.fillStyle = '#d4e4c0';
        context.font      = '26px "Segoe UI", Arial, sans-serif';
        const expiryText  = '∞  ' + translate('noExpiry');
        const expiryWidth = context.measureText(expiryText).width;

        context.fillText(expiryText, 62, dividerY + 69);

        const destinationWidth = Math.max(60, width - expiryWidth - 156);
        let destinationText    = destination;

        if (context.measureText(destinationText).width > destinationWidth)
        {
            while (destinationText.length && context.measureText(destinationText + '…').width > destinationWidth)
            {
                destinationText = destinationText.slice(0, -1);
            }

            destinationText += '…';
        }

        context.textAlign = 'right';
        context.fillStyle = '#9dae8f';
        context.fillText(destinationText, width - 62, dividerY + 69);

        if (fields.watermark.checked)
        {
            context.textAlign = 'center';
            context.font      = '22px "Segoe UI", Arial, sans-serif';
            context.fillText(translate('brandBy'), width / 2, dividerY + 123, width - 124);
        }

        return canvas;
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

    function exportImage(card)
    {
        if (!exportReady || exporting)
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

            const link      = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            link.href     = image;
            link.download = prefix + '-Axinomyus-' + timestamp + '.' + format.extension;
            document.body.appendChild(link);
            link.click();
            link.remove();
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
        if (event.target.name == 'title' || event.target.name == 'caption')
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

    downloadButton.addEventListener('click', function ()
    {
        exportImage(false);
    });

    cardButton.addEventListener('click', function ()
    {
        exportImage(true);
    });

    document.addEventListener('languagechange', renderQr);
    document.addEventListener('contenttypechange', renderQr);
    renderQr();
})();
