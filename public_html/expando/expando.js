function Expando(targetId, textObject) {
  var _initial = true;

  function getNextCharChange(from, to) {
    var i = 0;
    var res = '';
    var found = false;
    const len = Math.max(from.length, to.length);
    for (var i = 0;i < len;i++) {
      const charFrom = from[i];
      const charTo = to[i];
      if (charFrom === undefined && !found) {
        found = true;
        res += charTo;
      } else if (charFrom === undefined) {
        break;
      } else {
        if (charFrom === charTo) {
          res += charFrom;
        } else {
          if (!found) {
            if (charTo !== undefined) {
              res += charTo;
              found = true;
            } else {
              found = true;
            }
          } else {
            res += charFrom;
          }
        }
      }
    }
    return res;
  }

  function getNormalText(txt) {
    const el = document.createElement('span');
    el.className = 'expandoText';
    el.textContent = txt;
    return el;
  }

  function getLinkedTextElements(txtObj) {
    const elements = [];
    txtObj.forEach(part => {
      if (part[0] === '<') {
        const bits = part.split('>');
        const linkText = bits[1];
        const linkSectionKey = bits[0].slice(1);
        elements.push(getLink(linkText, textObject[linkSectionKey]))
      } else {
        elements.push(getNormalText(part));
      }
    })
    return elements;
  }

  function getLink(txt, expandToSection) {
    const el = document.createElement('span');
    const expandTo = getFullTextOfSection(expandToSection);
    el.textContent = txt;

    el.className = _initial? 'expandoLink' : 'expandoNewLink';
    el.onclick = () => expandText(el, txt, expandTo,
      (newElement) => {
        const elements = getLinkedTextElements(expandToSection);
        elements.forEach(part => {
          newElement.insertAdjacentElement("beforebegin", part);
        });
        newElement.parentNode.removeChild(newElement);
      });
    return el;
  }

  function expandText(target, from, to, onComplete) {
    var txt = from;
    var time = 0;
    const timeIncr = 35 ;
    setTimeout(() => {
      target.classList.add('expandoClicked');
    }, 10)
    target.classList.remove("expandoLink");
    target.classList.remove("expandoNewLink");
  
    // to trigger animation to restart - weird hack
    void target.offsetWidth;
    target.classList.add("expandoClicked");

    while (txt !== to) {
      let t = getNextCharChange(txt, to);
      txt = t;
      setTimeout(() => {
        target.textContent = t;
      }, time);
      time += timeIncr;
    }
    setTimeout(() => {
      onComplete(target);
    }, time + timeIncr);
  }

  function getFullTextOfSection(textObj) {
    let txt = '';
    textObj.forEach(part => {
      if (part[0] === '<') {
        txt += ' ' + part.split('>')[1];
      } else {
        txt += ' ' + part;
      }
    })
    return txt.trim();
  }

  const outer = document.getElementById(targetId);

  outer.innerHTML = '';
  const firstElements = getLinkedTextElements(textObject.a);
  firstElements.forEach(part => {
    outer.appendChild(part);
  });
  _initial = false;
}