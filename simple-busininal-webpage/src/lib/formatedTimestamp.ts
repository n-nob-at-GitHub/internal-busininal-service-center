// https://gist.github.com/mohokh67/e0c5035816f5a88d6133b085361ad15b
// get the current time in yyyy/mm/dd HH:MM:SS format.
const formatedTimestamp = ()=> {
  const d = new Date()
  const date = d.toISOString().split('T')[0].replace(/-/g, '/')
  const time = d.toTimeString().split(' ')[0]
  return `${date} ${time}`
}

export default formatedTimestamp
