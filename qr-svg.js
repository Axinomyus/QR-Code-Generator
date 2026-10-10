(function ()
{
    'use strict';

    function readFrame(qr)
    {
        // The bundled QRious renderer receives the encoder's module matrix here.
        const renderer = qr._canvasRenderer;
        const draw     = renderer.draw;
        let frame      = null;

        renderer.draw = function (nextFrame)
        {
            frame = nextFrame;
            draw.call(this, nextFrame);
        };

        try
        {
            qr.update();
        }
        finally
        {
            renderer.draw = draw;
        }

        if (!frame || !Number.isInteger(frame.width) || frame.width < 21 || frame.width > 177 || frame.buffer.length != frame.width * frame.width)
        {
            throw new Error('The QR encoder did not provide a valid module matrix.');
        }

        return { frame: frame, moduleSize: renderer.getModuleSize(frame), offset: renderer.getOffset(frame) };
    }

    function create(qr)
    {
        const { frame, moduleSize, offset } = readFrame(qr);
        const namespace = 'http://www.w3.org/2000/svg';
        const svg       = document.createElementNS(namespace, 'svg');
        const paper     = document.createElementNS(namespace, 'rect');
        const ink       = document.createElementNS(namespace, 'path');
        const segments  = [];

        for (let row = 0; row < frame.width; row++)
        {
            for (let column = 0; column < frame.width; column++)
            {
                if (!frame.buffer[row * frame.width + column])
                {
                    continue;
                }

                const start = column;

                while (column + 1 < frame.width && frame.buffer[row * frame.width + column + 1])
                {
                    column++;
                }

                const width = (column - start + 1) * moduleSize;
                segments.push('M' + (offset + start * moduleSize) + ' ' + (offset + row * moduleSize) + 'h' + width + 'v' + moduleSize + 'h-' + width + 'z');
            }
        }

        svg.setAttribute('width', String(qr.size));
        svg.setAttribute('height', String(qr.size));
        svg.setAttribute('viewBox', '0 0 ' + qr.size + ' ' + qr.size);
        svg.setAttribute('shape-rendering', 'crispEdges');
        paper.setAttribute('width', '100%');
        paper.setAttribute('height', '100%');
        paper.setAttribute('fill', qr.background);
        paper.setAttribute('fill-opacity', String(qr.backgroundAlpha));
        ink.setAttribute('d', segments.join(''));
        ink.setAttribute('fill', qr.foreground);
        ink.setAttribute('fill-opacity', String(qr.foregroundAlpha));
        svg.append(paper, ink);

        return new XMLSerializer().serializeToString(svg);
    }

    window.QrSvg = Object.freeze({ create: create });
})();
