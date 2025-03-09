const container = document.createElement('section');
container.id = 'toast-container';
document.body.before(container);
const template = document.createElement('div');
template.classList.add('toast');
template.appendChild(document.createElement('span'));

const showToast = (message) => {
    const toast = template.cloneNode(true);
    toast.querySelector('span').textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        flipToast(toast);
    }, 3000);
}

const flipToast = toast => {
    const first = container.offsetHeight;
    container.removeChild(toast);
    const last = container.offsetHeight;

    container.animate([
        { transform: `translateY(${first - last}px)` },
        { transform: 'translateY(0)' }
    ], {
        duration: 150,
        easing: 'ease-out'
    });
}

export default showToast;