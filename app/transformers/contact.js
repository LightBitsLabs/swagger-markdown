/**
 * http://swagger.io/specification/#contactObject
 * Contact info transformer
 */
module.exports = contact => {
  const res = [];

  //if ('name' in contact) {
  //  res.push(`${contact.name}`);
  //}
  if ('url' in contact) {
    res.push(`[Lightbits Labs Website](${contact.url})`);
    res.push('');
  }
  if ('email' in contact) {
    res.push(`[Lightbits Labs EMail](${contact.email})`);
    res.push('');
  }

  if (res.length > 0) {
    res.unshift('**Contact information:**\n');
  }

  return res.length > 0 ? res.join('\n') : null;
};
