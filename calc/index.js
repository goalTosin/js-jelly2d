const keyElt = document.querySelector('.keys')
const screen = document.querySelector('.screen')

const keys = [
  1,2,3,4,5,6,7,8,9,0,'C','e=','p+','m-','tx' ,'d/'
]
// let
for (let i = 0; i < keys.length; i++) {
  let k = keys[i]
  let n = k.length === 2 ? k[1] : k
  let c = k.length===2 ? k[0] : k
  const key =str2Elt(`<div class="key m${c}" style="grid-area: m${c};">${n}</div>`)
  key.addEventListener('click', () => {
    switch (n) {
      case 'C':
        screen.innerHTML = ''
        break;
    
        case '=':
          screen.innerHTML = eval(screen.innerHTML.replaceAll('x', '*'))
          break;
      
        default:
    screen.innerHTML += n
        break;
    }
  })
  keyElt.append(key)
}

function str2Elt(str) {
  const d = document.createElement('div')
  d.innerHTML = str
  return d.firstChild
}