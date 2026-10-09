(function ()
{
    'use strict';

    const settings      = document.getElementById('card-background-settings');
    const type          = document.getElementById('card-background-type');
    const color         = document.getElementById('card-color');
    const colorEnd      = document.getElementById('card-color-end');
    const opacity       = document.getElementById('card-opacity');
    const fileInput     = document.getElementById('card-image');
    const removeButton  = document.getElementById('remove-card-image');
    const preview       = document.getElementById('card-background-preview');
    const card          = document.getElementById('qrImgContainer');
    const errorLabel    = document.getElementById('card-background-error');
    const statusLabel   = document.getElementById('card-image-status');
    const translate     = window.QrI18n.translate;

    let image       = null;
    let loading     = false;
    let requestId   = 0;
    let errorKey    = '';
    let imageName   = '';

    function isReady()
    {
        return type.value != 'image' || (!loading && image != null);
    }

    function draw(context, width, height)
    {
        context.save();

        if (type.value != 'default')
        {
            context.globalAlpha = Number(opacity.value) / 100;
        }

        if (type.value == 'image')
        {
            if (image)
            {
                const scale        = Math.max(width / image.width, height / image.height);
                const targetWidth  = image.width * scale;
                const targetHeight = image.height * scale;

                context.drawImage(image, (width - targetWidth) / 2, (height - targetHeight) / 2, targetWidth, targetHeight);
            }
        }
        else
        {
            context.fillStyle = color.value;

            if (type.value == 'default' || type.value == 'gradient')
            {
                let start = color.value;
                let end   = colorEnd.value;

                if (type.value == 'default')
                {
                    start = '#3d4b2a';
                    end   = '#182315';
                }

                const gradient = context.createLinearGradient(0, 0, width, height);

                gradient.addColorStop(0, start);
                gradient.addColorStop(1, end);
                context.fillStyle = gradient;
            }

            context.fillRect(0, 0, width, height);
        }

        context.restore();
    }

    function getTextColors()
    {
        const sample  = document.createElement('canvas');
        const context = sample.getContext('2d', { willReadFrequently: true });

        sample.width      = 16;
        sample.height     = 16;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, 16, 16);
        draw(context, 16, 16);

        const pixels = context.getImageData(0, 0, 16, 16).data;
        let brightness = 0;

        for (let index = 0; index < pixels.length; index += 4)
        {
            brightness += pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722;
        }

        if (brightness / 256 > 150)
        {
            return { title: '#193409', text: '#17251b', muted: '#30402a', border: '#536c40' };
        }

        return { title: '#b1f55c', text: '#d4e4c0', muted: '#c1cfb3', border: '#79964f' };
    }

    function renderPreview()
    {
        const bounds = card.getBoundingClientRect();
        const ratio  = Math.min(window.devicePixelRatio || 1, 2);

        preview.width  = Math.max(1, Math.round(bounds.width * ratio));
        preview.height = Math.max(1, Math.round(bounds.height * ratio));

        const context = preview.getContext('2d');

        if (document.getElementById('format').value == 'jpeg')
        {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, preview.width, preview.height);
        }

        draw(context, preview.width, preview.height);

        const colors = getTextColors();

        for (const [name, value] of Object.entries(colors))
        {
            card.style.setProperty('--card-' + name, value);
        }
    }

    function update()
    {
        document.getElementById('card-color-settings').hidden       = !['solid', 'gradient'].includes(type.value);
        document.getElementById('card-gradient-settings').hidden    = type.value != 'gradient';
        document.getElementById('card-image-settings').hidden       = type.value != 'image';
        document.getElementById('card-opacity-settings').hidden     = type.value == 'default';
        document.getElementById('card-color-value').textContent     = color.value.toUpperCase();
        document.getElementById('card-color-end-value').textContent = colorEnd.value.toUpperCase();
        document.getElementById('card-opacity-value').textContent   = opacity.value + '%';
        removeButton.hidden = !image && !loading;
        errorLabel.hidden   = type.value != 'image' || !errorKey;
        errorLabel.textContent = '';

        if (errorKey)
        {
            errorLabel.textContent = translate(errorKey);
        }

        statusLabel.hidden      = type.value != 'image';
        statusLabel.textContent = translate('cardImageNeeded');

        if (image)
        {
            statusLabel.textContent = translate('cardImageSelected', { name: imageName });
        }

        if (loading)
        {
            statusLabel.textContent = translate('cardImageLoading');
        }

        renderPreview();
        document.dispatchEvent(new Event('cardbackgroundchange'));
    }

    async function loadImage()
    {
        const file    = fileInput.files[0];
        const current = ++requestId;

        if (!file)
        {
            loading = false;
            update();
            return;
        }

        errorKey = '';
        loading  = false;

        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || !file.size || file.size > 10 * 1024 * 1024)
        {
            errorKey        = 'cardImageInvalid';
            fileInput.value = '';
            update();
            return;
        }

        loading = true;
        update();
        let bitmap = null;

        try
        {
            bitmap = await createImageBitmap(file);

            if (current != requestId)
            {
                return;
            }

            if (bitmap.width > 8192 || bitmap.height > 8192 || bitmap.width * bitmap.height > 16000000)
            {
                errorKey = 'cardImageInvalid';
                return;
            }

            const nextImage = document.createElement('canvas');
            const scale     = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));

            nextImage.width  = Math.max(1, Math.round(bitmap.width * scale));
            nextImage.height = Math.max(1, Math.round(bitmap.height * scale));
            nextImage.getContext('2d').drawImage(bitmap, 0, 0, nextImage.width, nextImage.height);
            image     = nextImage;
            imageName = file.name;
        }
        catch (error)
        {
            if (current == requestId)
            {
                console.warn('The selected card background could not be decoded.', error);
                errorKey = 'cardImageFailed';
            }
        }
        finally
        {
            if (bitmap)
            {
                bitmap.close();
            }

            if (current == requestId)
            {
                loading         = false;
                fileInput.value = '';
                update();
            }
        }
    }

    settings.addEventListener('input', function (event)
    {
        event.stopPropagation();

        if (event.target != fileInput)
        {
            update();
        }
    });

    fileInput.addEventListener('change', loadImage);
    removeButton.addEventListener('click', function ()
    {
        requestId++;
        image           = null;
        imageName       = '';
        errorKey        = '';
        loading         = false;
        fileInput.value = '';
        update();
    });

    window.QrCardBackground = Object.freeze({ draw: draw, isReady: isReady, getTextColors: getTextColors });
    new ResizeObserver(renderPreview).observe(card);
    document.addEventListener('languagechange', update);
    document.getElementById('format').addEventListener('input', renderPreview);
    update();
})();
