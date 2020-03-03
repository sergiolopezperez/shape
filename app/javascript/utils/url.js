export function parseUrl(urlStr) {
  const url = document.createElement('a')
  url.href = urlStr
  return url
}

export function stringifyUrlParams(obj) {
  return Object.keys(obj)
    .map(function(key) {
      return key + '=' + obj[key]
    })
    .join('&')
}

export function apiUrl(path) {
  return `api/v1/${path}`
}

export function useTemplateInMyCollection(templateId) {
  // route to use this template
  const route = `/templates/${templateId}/use_in_my_collection`
  // can't use router in this case, have to full redirect
  window.location.href = route
}

export const loginRedirectPath = (redirect = null) => {
  let path = '/login'
  if (redirect) {
    path += `?redirect=${encodeURI(redirect)}`
  }
  return path
}

export default {
  apiUrl,
  parseUrl,
}
