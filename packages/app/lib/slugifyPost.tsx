const slugify: (str: string) => string = str =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'untitled';

module.exports = (post: { id: number; title: string }): string =>
  `/post/${post.id}-${slugify(post.title)}`;
