// hierarchy.js
export function buildTree(model, onSelect) {
  const panel = document.getElementById('hierarchy-tree');
  panel.innerHTML = ''; // 초기화
  
  const ul = document.createElement('ul');
  ul.appendChild(createNode(model, onSelect));
  panel.appendChild(ul);
}

function createNode(object, onSelect) {
  const li = document.createElement('li');
  
  if (object.isMesh) {
    li.textContent = `${object.name}  [${object.material.name}]`;
  } else {
    li.textContent = object.name;
  }
  
  li.addEventListener('click', (e) => {
    e.stopPropagation();
    onSelect(object);
  });

  // 자식 있으면 재귀
  if (object.children.length > 0) {
    const ul = document.createElement('ul');
    object.children.forEach(child => {
      ul.appendChild(createNode(child, onSelect));
    });
    li.appendChild(ul);
  }

  return li;
}


export function updateInspector(object) {
  const panel = document.getElementById('inspector-panel');
  
  if (!object.isMesh) {
    panel.innerHTML = `<p>${object.name} (Group)</p>`;
    return;
  }

  const mat = object.material;
  const geo = object.geometry;
  const vertices = geo.attributes.position.count;
  const triangles = geo.index ? geo.index.count / 3 : vertices / 3;

  panel.innerHTML = `
    <p><b>오브젝트</b>: ${object.name}</p>
    <p><b>재질</b>: ${mat.name}</p>
    <p><b>metalness</b>: ${mat.metalness}</p>
    <p><b>roughness</b>: ${mat.roughness}</p>
    <p><b>버텍스</b>: ${vertices}</p>
    <p><b>삼각형</b>: ${triangles}</p>
  `;
}