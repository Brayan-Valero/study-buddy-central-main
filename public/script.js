document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    // Simulate fetching data
    const fetchAsignaturas = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { codigo: 'MAT101', descripcion: 'Matemáticas', alumnos: [] },
                    { codigo: 'FIS102', descripcion: 'Física', alumnos: [] }
                ]);
            }, 1000);
        });
    };

    // Render asignaturas
    const renderAsignaturas = (asignaturas) => {
        root.innerHTML = '';
        asignaturas.forEach(asignatura => {
            const div = document.createElement('div');
            div.innerHTML = `<strong>${asignatura.codigo}: ${asignatura.descripcion}</strong><br>
                             <button onclick="addAlumno('${asignatura.codigo}')">Agregar Alumno</button>
                             <ul id="alumnos-${asignatura.codigo}"></ul>`;
            root.appendChild(div);
        });
    };

    // Function to add a student
    window.addAlumno = (codigo) => {
        const nombreAlumno = prompt('Ingrese el nombre del alumno:');
        if (nombreAlumno) {
            const asignatura = asignaturas.find(a => a.codigo === codigo);
            asignatura.alumnos.push(nombreAlumno);
            const ul = document.getElementById(`alumnos-${codigo}`);
            const li = document.createElement('li');
            li.textContent = nombreAlumno;
            ul.appendChild(li);
        }
    };

    // Initial load
    let asignaturas = [];
    fetchAsignaturas().then(data => {
        asignaturas = data;
        renderAsignaturas(asignaturas);
    });
});
