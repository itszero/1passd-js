function findForm(decrypted, page) {
  // match htmlAction first
  const forms = Object.keys(page.forms);
  for (var i=0;i<forms.length;i++) {
    const id = forms[i];
    if (page.forms[id].htmlAction === decrypted.htmlAction) {
      return id;
    }
  }

  // then match for ID
  for (var i=0;i<forms.length;i++) {
    const id = forms[i];
    if (page.forms[id].htmlID === decrypted.htmlID) {
      return id;
    }
  }

  // last resort, match a form with text and password fields
  for (var i=0;i<forms.length;i++) {
    const id = forms[i];
    const fields = page.fields.filter((field) => field.form === id);
    if (
      fields.find((field) => ['text', 'email'].indexOf(field.onepasswordFieldType) > -1) &&
      fields.find((field) => field.onepasswordFieldType === 'password')
    ) {
      return id;
    }
  }
}

function filler(item, page) {
  const formId = findForm(item.decrypted, page);
  const fields = page.fields.filter((field) => field.form === formId);

  const script = item.decrypted.fields
    .filter((field) => ['T', 'P'].indexOf(field.type) > -1)
    .reduce((script, itemField) => {
      const pageField = fields.find((field) =>
        field.htmlName === itemField.name || field.htmlID === itemField.id
      );
      console.log('fill', itemField, 'to', pageField);

      if (pageField) {
        return [
          ...script,
          ['click_on_opid', pageField.opid],
          ['fill_by_opid', pageField.opid, itemField.value]
        ];
      } else {
        return script;
      }
    }, []);

  const autosubmit = {
    focusOpid: (fields.find((field) => field.onepasswordFieldType === 'password') || fields[0]).opid,
    'helper-capable-of-press-enter-key': false,
    submit: true
  };

  return {
    script,
    autosubmit
  };
}

export default filler;