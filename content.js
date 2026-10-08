(function ()
{
    'use strict';

    const fields = document.getElementById('qr-form').elements;
    const tabs   = Array.from(document.querySelectorAll('[data-content-type]'));
    const types  = ['url', 'text', 'wifi', 'email'];
    let type     = 'url';

    function selectType(nextType)
    {
        if (!types.includes(nextType))
        {
            return;
        }

        type = nextType;

        for (const tab of tabs)
        {
            const selected = tab.dataset.contentType == type;

            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = -1;
            document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;

            if (selected)
            {
                tab.tabIndex = 0;
            }
        }

        document.dispatchEvent(new Event('contenttypechange'));
    }

    function readUrl()
    {
        const value = fields.value.value.trim();

        if (!value)
        {
            return { value: '' };
        }

        if (!/^https?:\/\//i.test(value) || /\s/.test(value) || !URL.canParse(value))
        {
            return { error: 'invalidUrl', field: fields.value };
        }

        return { value: value, destination: new URL(value).host, field: fields.value };
    }

    function readText()
    {
        const value = fields.text.value;

        if (!value.trim())
        {
            return { value: '' };
        }

        return { value: value, destination: window.QrI18n.translate('textInside'), field: fields.text };
    }

    function escapeWifiValue(value)
    {
        return value.replace(/[\\;,:\"]/g, function (character)
        {
            return '\\' + character;
        });
    }

    function readWifi()
    {
        const ssid     = fields.wifiSsid.value;
        const security = fields.wifiSecurity.value;
        const password = fields.wifiPassword.value;
        const open     = security == 'nopass';

        fields.wifiPassword.disabled = open;
        document.getElementById('wifi-password-field').hidden = open;

        if (!ssid)
        {
            return { value: '' };
        }

        if (new TextEncoder().encode(ssid).length > 32)
        {
            return { error: 'wifiSsidTooLong', field: fields.wifiSsid };
        }

        if (!['WPA', 'WEP', 'nopass'].includes(security))
        {
            return { error: 'wifiSecurityInvalid', field: fields.wifiSecurity };
        }

        if (!open && !password)
        {
            return { error: 'wifiPasswordRequired', field: fields.wifiPassword };
        }

        if (!open && new TextEncoder().encode(password).length > 64)
        {
            return { error: 'wifiPasswordTooLong', field: fields.wifiPassword };
        }

        const parameters = ['T:' + security, 'S:' + escapeWifiValue(ssid)];

        if (!open)
        {
            parameters.push('P:' + escapeWifiValue(password));
        }

        if (fields.wifiHidden.checked)
        {
            parameters.push('H:true');
        }

        return { value: 'WIFI:' + parameters.join(';') + ';;', destination: ssid, field: fields.wifiSsid };
    }

    function readEmail()
    {
        const address = fields.emailAddress.value.trim();

        if (!address)
        {
            return { value: '' };
        }

        if (!fields.emailAddress.validity.valid)
        {
            return { error: 'invalidEmail', field: fields.emailAddress };
        }

        const separator = address.lastIndexOf('@');
        const recipient = encodeURIComponent(address.slice(0, separator)) + '@' + encodeURIComponent(address.slice(separator + 1));
        const subject   = fields.emailSubject.value;
        const body      = fields.emailBody.value.replace(/\r\n|\r|\n/g, '\r\n');
        const headers   = [];

        if (subject)
        {
            headers.push('subject=' + encodeURIComponent(subject));
        }

        if (body)
        {
            headers.push('body=' + encodeURIComponent(body));
        }

        let value = 'mailto:' + recipient;

        if (headers.length)
        {
            value += '?' + headers.join('&');
        }

        return { value: value, destination: address, field: fields.emailAddress };
    }

    function readContent()
    {
        for (const input of document.querySelectorAll('.content-panel [aria-invalid]'))
        {
            input.removeAttribute('aria-invalid');
        }

        switch (type)
        {
            case 'text':
                return readText();
            case 'wifi':
                return readWifi();
            case 'email':
                return readEmail();
            default:
                return readUrl();
        }
    }

    for (const tab of tabs)
    {
        tab.addEventListener('click', function ()
        {
            selectType(tab.dataset.contentType);
        });

        tab.addEventListener('keydown', function (event)
        {
            let index = tabs.indexOf(tab);

            switch (event.key)
            {
                case 'ArrowRight':
                    index = (index + 1) % tabs.length;
                    break;
                case 'ArrowLeft':
                    index = (index + tabs.length - 1) % tabs.length;
                    break;
                case 'Home':
                    index = 0;
                    break;
                case 'End':
                    index = tabs.length - 1;
                    break;
                default:
                    return;
            }

            event.preventDefault();
            selectType(tabs[index].dataset.contentType);
            tabs[index].focus();
        });
    }

    window.QrContent = Object.freeze({ read: readContent });
})();
