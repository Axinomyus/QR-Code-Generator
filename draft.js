(function ()
{
    'use strict';

    const form          = document.getElementById('qr-form');
    const resetButton   = document.getElementById('reset-form');
    const status        = document.getElementById('draft-status');
    const exportActions = document.querySelector('.export-actions');
    const controls      = Array.from(form.querySelectorAll('input:not([type="file"]), textarea, select'));
    const translate     = window.QrI18n.translate;

    let database    = null;
    let applying    = true;
    let revision    = 0;
    let statusKey   = '';
    let lastFailure = '';

    function showStatus(key)
    {
        statusKey          = key;
        status.textContent = translate(key);
    }

    function lockForm(locked)
    {
        form.inert           = locked;
        exportActions.inert  = locked;
        resetButton.disabled = locked;
        form.setAttribute('aria-busy', String(locked));
    }

    function reportFailure(key, error)
    {
        // Report the failure category without logging a saved field or image.
        const name = error.name || 'Error';

        if (lastFailure != name)
        {
            console.warn('QR draft storage failed during ' + key + ' (' + name + ').');
            lastFailure = name;
        }

        showStatus(key);
    }

    function openDatabase()
    {
        return new Promise(function (resolve, reject)
        {
            const request = indexedDB.open('axinomyus-qr-studio', 1);
            let settled   = false;
            const timeout = setTimeout(function ()
            {
                settled = true;
                reject(new Error('Draft storage did not open in time.'));
            }, 5000);

            request.onupgradeneeded = function ()
            {
                request.result.createObjectStore('draft');
            };
            request.onsuccess = function ()
            {
                clearTimeout(timeout);

                if (settled)
                {
                    request.result.close();
                    return;
                }

                settled = true;
                resolve(request.result);
            };
            request.onerror = function ()
            {
                clearTimeout(timeout);
                settled = true;
                reject(request.error);
            };
            request.onblocked = function ()
            {
                clearTimeout(timeout);
                settled = true;
                reject(new Error('Draft storage is blocked by another window.'));
            };
        });
    }

    function transact(mode, operation)
    {
        return new Promise(function (resolve, reject)
        {
            if (!database)
            {
                reject(new Error('Draft storage is unavailable.'));
                return;
            }

            const transaction = database.transaction('draft', mode);
            const request     = operation(transaction.objectStore('draft'));
            const timeout     = setTimeout(function ()
            {
                transaction.abort();
            }, 5000);

            transaction.oncomplete = function ()
            {
                clearTimeout(timeout);
                resolve(request.result);
            };
            transaction.onabort = function ()
            {
                clearTimeout(timeout);
                reject(transaction.error || new Error('Draft storage transaction was aborted.'));
            };
        });
    }

    function captureDraft()
    {
        const values = {};

        for (const control of controls)
        {
            values[control.id] = control.value;

            if (control.type == 'checkbox')
            {
                values[control.id] = control.checked;
            }
        }

        return { schema: 1, type: window.QrContent.getType(), values: values, image: window.QrCardBackground.getImage() };
    }

    function validateDraft(draft)
    {
        if (draft.schema != 1 || !['url', 'text', 'wifi', 'email'].includes(draft.type) || !draft.values || typeof draft.values != 'object')
        {
            throw new Error('Saved draft has an unsupported structure.');
        }

        for (const control of controls)
        {
            if (!Object.hasOwn(draft.values, control.id))
            {
                continue;
            }

            const value = draft.values[control.id];

            if (control.type == 'checkbox')
            {
                if (typeof value != 'boolean')
                {
                    throw new Error('Saved checkbox value is invalid.');
                }

                continue;
            }

            if (typeof value != 'string' || value.length > 1000000)
            {
                throw new Error('Saved field value is invalid.');
            }

            if (control.tagName == 'SELECT' && !Array.from(control.options).some(function (option)
            {
                return option.value == value;
            }))
            {
                throw new Error('Saved option is unsupported.');
            }

            if (control.type == 'color' && !/^#[0-9a-f]{6}$/i.test(value))
            {
                throw new Error('Saved color is invalid.');
            }
        }

        if (draft.image != null && (!(draft.image instanceof File) || !['image/png', 'image/jpeg', 'image/webp'].includes(draft.image.type) || !draft.image.size || draft.image.size > 10 * 1024 * 1024))
        {
            throw new Error('Saved background image is invalid.');
        }
    }

    async function restoreDraft(draft)
    {
        validateDraft(draft);

        for (const control of controls)
        {
            if (!Object.hasOwn(draft.values, control.id))
            {
                continue;
            }

            if (control.type == 'checkbox')
            {
                control.checked = draft.values[control.id];
                continue;
            }

            control.value = draft.values[control.id];
        }

        window.QrContent.selectType(draft.type);

        if (draft.image)
        {
            await window.QrCardBackground.restoreImage(draft.image);
        }
        else
        {
            window.QrCardBackground.update();
        }

        window.QrStudio.refresh();
    }

    async function saveDraft()
    {
        if (applying)
        {
            return;
        }

        const current = ++revision;
        showStatus('draftSaving');

        try
        {
            const draft = captureDraft();

            await transact('readwrite', function (store)
            {
                return store.put(draft, 'current');
            });

            if (current == revision)
            {
                lastFailure = '';
                showStatus('draftSaved');
            }
        }
        catch (error)
        {
            if (current == revision)
            {
                reportFailure('draftSaveFailed', error);
            }
        }
    }

    async function resetDraft()
    {
        if (applying)
        {
            return;
        }

        applying = true;
        revision++;
        lockForm(true);

        try
        {
            if (!database)
            {
                database = await openDatabase();
            }

            // Deletion is queued after previous saves, before the form is cleared.
            await transact('readwrite', function (store)
            {
                return store.delete('current');
            });

            form.reset();
            window.QrContent.selectType('url');
            window.QrCardBackground.reset();
            window.QrStudio.refresh();
            showStatus('draftReset');
        }
        catch (error)
        {
            reportFailure('draftResetFailed', error);
        }
        finally
        {
            applying = false;
            lockForm(false);
        }
    }

    async function initialize()
    {
        let autoFill = false;

        lockForm(true);
        showStatus('draftLoading');

        try
        {
            database = await openDatabase();
            database.onversionchange = function ()
            {
                database.close();
                database = null;
                showStatus('draftSaveFailed');
            };

            const draft = await transact('readonly', function (store)
            {
                return store.get('current');
            });

            if (draft != null)
            {
                await restoreDraft(draft);
                showStatus('draftRestored');
            }
            else
            {
                autoFill = true;
                showStatus('draftEmpty');
            }
        }
        catch (error)
        {
            reportFailure('draftRestoreFailed', error);
        }
        finally
        {
            applying = false;
            lockForm(false);
        }

        window.QrContent.initialize(autoFill);
    }

    form.addEventListener('input', saveDraft);
    document.addEventListener('contenttypechange', saveDraft);
    document.addEventListener('designchange', saveDraft);
    document.addEventListener('cardbackgroundchange', saveDraft);
    document.addEventListener('languagechange', function ()
    {
        if (statusKey)
        {
            showStatus(statusKey);
        }
    });
    resetButton.addEventListener('click', resetDraft);
    initialize();
})();
