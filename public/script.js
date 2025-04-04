document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');

    // Simulate fetching data
    const fetchAsignaturas = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { codigo: 'MAT101', descripcion: 'Matemáticas' },
                    { codigo: 'FIS102', descripcion: 'Física' }
                ]);
            }, 1000);
        });
    };

    // Render asignaturas
    const renderAsignaturas = (asignaturas) => {
        root.innerHTML = '';
        asignaturas.forEach(asignatura => {
            const div = document.createElement('div');
            div.textContent = `${asignatura.codigo}: ${asignatura.descripcion}`;
            root.appendChild(div);
        });
    };

    // Initial load
    fetchAsignaturas().then(renderAsignaturas);
});
