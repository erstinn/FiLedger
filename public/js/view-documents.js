const users = [
    {
        name: 'Mark',
        department: 'CS',
        document: 1,
        activity: 'downloaded',
    },
    {
        name: 'Dav',
        department: 'CS',
        document: 999,
        activity: 'edited',
    },
    {
        name: 'Thor',
        department: 'MMA',
        document: 0,
        activity: 'downloaded',
    },
    {
        name: 'Berbaderg',
        department: 'MMA',
        document: 1200,
        activity: 'downloaded',
    },
    {
        name: 'TamTam',
        department: 'Engineering',
        document: 10000,
        activity: 'edited',
    },
];

let data = document.querySelectorAll('.data');
const revertButt = document.querySelector('.revert');
data.forEach(item => {
    item.addEventListener('click', () => {
        if (document.querySelector('.clickedData') != null) {
            document.querySelector('.clickedData')
                .classList.remove('clickedData');
        }
        item.classList.add('clickedData');
        revertButt.disabled = false;
    });
});
