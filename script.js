const pantalla = document.getElementById('pantalla');
const menuModos = document.getElementById('menu-modos');
const submenuMatrices = document.getElementById('submenu-matrices');

let operacionMatrizActual = '';

// ===== MENÚS =====
document.getElementById('btn-modo-m').onclick = e => {
    e.stopPropagation();
    menuModos.classList.toggle('show');
};

document.getElementById('trigger-matrices').onclick = e => {
    e.stopPropagation();
    submenuMatrices.classList.toggle('show');
};

document.addEventListener('click', () => {
    menuModos.classList.remove('show');
    submenuMatrices.classList.remove('show');
});

// ===== VOLVER =====
function volverNormal(){
    document.getElementById('seccion-normal').style.display = 'block';
    document.getElementById('seccion-matrices').style.display = 'none';
    document.getElementById('seccion-radicales').style.display = 'none';
    menuModos.classList.remove('show');
    submenuMatrices.classList.remove('show');
}

document.getElementById('btn-volver').onclick = volverNormal;
document.getElementById('btn-volver-radical').onclick = volverNormal;

// ===== ENTRAR A RADICALES =====
document.getElementById('abrir-radicales').onclick = () => {
    document.getElementById('seccion-normal').style.display = 'none';
    document.getElementById('seccion-radicales').style.display = 'block';
};

// ===== ENTRAR A MATRICES =====
document.querySelectorAll('#submenu-matrices .item-menu').forEach(item=>{
    item.onclick = ()=>{
        operacionMatrizActual = item.dataset.op;
        document.getElementById('seccion-normal').style.display = 'none';
        document.getElementById('seccion-matrices').style.display = 'block';
        document.getElementById('titulo-operacion').innerText = item.innerText;

        document.getElementById('selector-potencia').style.display =
            operacionMatrizActual === 'potencia' ? 'block' : 'none';

        document.getElementById('box-matriz-b').style.display =
            ['suma','resta','multiplicacion'].includes(operacionMatrizActual)
            ? 'block' : 'none';

        generateMatrixInputs('A');
        if(['suma','resta','multiplicacion'].includes(operacionMatrizActual)){
            generateMatrixInputs('B');
        }
    };
});

// ===== FUNCIONES MATRICES =====
function multiplyMatrices(A,B){
    return A.map(r=>B[0].map((_,j)=>r.reduce((s,_,i)=>s+r[i]*B[i][j],0)));
}

function matrixPower(A,n){
    let r=A;
    for(let i=1;i<n;i++) r=multiplyMatrices(r,A);
    return r;
}

// ===== DETERMINANTE =====
function determinante(A){

    if(A.length !== A[0].length){
        alert("Error: la matriz debe ser cuadrada");
        return null;
    }

    if(A.length===1) return A[0][0];

    if(A.length===2)
        return A[0][0]*A[1][1]-A[0][1]*A[1][0];

    if(A.length===3)
        return A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1])
             - A[0][1]*(A[1][0]*A[2][2]-A[1][2]*A[2][0])
             + A[0][2]*(A[1][0]*A[2][1]-A[1][1]*A[2][0]);

    alert("Solo soporta determinantes hasta 3x3");
    return null;
}

// ===== EJECUTAR =====
document.getElementById('btn-ejecutar-op').onclick = ()=>{
    const A=getMatrix('A');
    if(!A) return;

    let res;

    if(operacionMatrizActual==='suma'){
        const B=getMatrix('B');
        res=A.map((r,i)=>r.map((v,j)=>v+B[i][j]));
    }
    else if(operacionMatrizActual==='resta'){
        const B=getMatrix('B');
        res=A.map((r,i)=>r.map((v,j)=>v-B[i][j]));
    }
    else if(operacionMatrizActual==='multiplicacion'){
        res=multiplyMatrices(A,getMatrix('B'));
    }
    else if(operacionMatrizActual==='transpuesta'){

        if(A.length === 0 || !A[0]){
            alert("Error: matriz inválida");
            return;
        }

        res=A[0].map((_,c)=>A.map(r=>r[c]));
    }
    else if(operacionMatrizActual==='potencia'){

        if(A.length !== A[0].length){
            alert("Error: la matriz debe ser cuadrada para potencia");
            return;
        }

        const n = parseInt(document.getElementById('grado-potencia').value);

        if(isNaN(n) || n < 1){
            alert("La potencia debe ser mayor o igual a 1");
            return;
        }

        res = matrixPower(A,n);
    }
    else if(operacionMatrizActual==='inversa'){
        if(A.length===2 && A[0].length===2){
            const inv = inversa2x2(A);
            if(!inv){ alert("La matriz no tiene inversa (det=0)"); return; }
            showResult(inv);
            return;
        }
        else if(A.length===3 && A[0].length===3){
            const inv = inversa3x3(A);
            if(!inv){ alert("La matriz no tiene inversa (det=0)"); return; }
            showResult(inv);
            return;
        }
        else{
            alert("La inversa solo funciona para 2x2 y 3x3");
            return;
        }
    }
    else if(operacionMatrizActual==='determinante'){
        const det = determinante(A);
        if(det === null) return;

        document.getElementById('resultMatrix').innerHTML =
            `<div style="font-size:28px;color:#4ecca3;text-align:center;width:100%;">Det = ${det}</div>`;
        return;
    }

    showResult(res);
};

// ===== INPUTS =====
function generateMatrixInputs(matrix){
    const rows = parseInt(document.getElementById('rows'+matrix).value);
    const cols = parseInt(document.getElementById('cols'+matrix).value);
    const container = document.getElementById('matrix'+matrix);

    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols}, 50px)`;

    for(let i=0;i<rows;i++){
        for(let j=0;j<cols;j++){
            const input = document.createElement('input');
            input.type = 'number';
            input.value = '0';
            container.appendChild(input);
        }
    }
}

function getMatrix(matrix){
    const rows = parseInt(document.getElementById('rows'+matrix).value);
    const cols = parseInt(document.getElementById('cols'+matrix).value);

    if(rows <= 0 || cols <= 0){
        alert("Error: filas y columnas deben ser mayores que 0");
        return null;
    }

    const inputs = document.querySelectorAll('#matrix'+matrix+' input');

    let k=0;
    const m=[];
    for(let i=0;i<rows;i++){
        m[i]=[];
        for(let j=0;j<cols;j++){
            m[i][j]=parseFloat(inputs[k++].value)||0;
        }
    }
    return m;
}

// ===== FORMATO BONITO =====
function formatearNumero(n){
    if (Math.abs(n) < 1e-10) return "0";
    if (Number.isInteger(n)) return n.toString();
    return parseFloat(n.toFixed(4)).toString();
}

function showResult(M){
    const container = document.getElementById('resultMatrix');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${M[0].length}, 50px)`;

    M.forEach(r=>{
        r.forEach(v=>{
            const div = document.createElement('div');
            div.className = 'matrix-result';
            div.innerText = formatearNumero(v);
            container.appendChild(div);
        });
    });
}

// ===== INVERSAS =====
function inversa2x2(A){
    const det = determinante(A);
    if(det === 0 || det === null) return null;

    return [
        [ A[1][1]/det, -A[0][1]/det ],
        [ -A[1][0]/det, A[0][0]/det ]
    ];
}

function inversa3x3(A){
    const det = determinante(A);
    if(det === 0 || det === null) return null;

    const cofactor = (r,c)=>{
        const minor = A.filter((_,i)=>i!==r)
                       .map(row=>row.filter((_,j)=>j!==c));
        return ((r+c)%2===0?1:-1) * determinante(minor);
    };

    let cof = [];
    for(let i=0;i<3;i++){
        let row=[];
        for(let j=0;j<3;j++){
            row.push(cofactor(i,j));
        }
        cof.push(row);
    }

    return cof[0].map((_,c)=>
        cof.map(r=> r[c]/det )
    );
}
