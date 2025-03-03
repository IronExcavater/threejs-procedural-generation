const container = document.querySelector('#toast-container');
const template = container.querySelector('#toast-template');

export const showToast = (message) => {
    const toast = template.content.cloneNode(true).firstElementChild;
    toast.querySelector('[tpl="toast"]').textContent = message;
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