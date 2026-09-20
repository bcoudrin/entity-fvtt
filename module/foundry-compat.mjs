export function renderTemplate(path, data = {}) {
  return foundry.applications.handlebars.renderTemplate(path, data);
}