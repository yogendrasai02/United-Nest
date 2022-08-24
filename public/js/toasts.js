import { Toast } from 'bootstrap';

// status: success|fail|error
export const showToast = (status, message = 'Something went wrong. Please try after some', timeInSec = 10) => {
    // 0. remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
        toast.parentElement.removeChild(toast);
    });
    // 1. create toast element
    const toast = document.createElement('div');
    toast.classList.add('toast', 'position-fixed', 'top-0', 'end-0');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    // 2. fill with data
    let statusColor = 'success';
    const successIcon = '<i class="ph-check-circle icon-3"></i>';
    const errorIcon = '<i class="ph-warning-circle icon-3"></i>';
    const failIcon = '<i class="ph-x-circle icon-3"></i>';
    let icon = successIcon;
    if(status === 'fail') {
        statusColor = 'danger';
        icon = failIcon;
    }
    if(status === 'error') {
        statusColor = 'warning';
        icon = errorIcon;
    }
    toast.innerHTML = `
    <div class="toast-header text-bg-${statusColor} d-flex justify-content-between">
        <div class='d-flex align-items-center'>
            ${icon} &nbsp;
            <strong>${status.toUpperCase()}</strong>
        </div>
        <i type="button" class="ph-x icon-3" data-bs-dismiss="toast" aria-label="Close"></i>
    </div>
    <div class="toast-body">
        ${message}
    </div>
    `;
    document.body.appendChild(toast);
    // 3. create Bootstrap Toast object & show it
    const toastObj = new Toast(toast, {
        animation: true,
        autohide: true,
        delay: timeInSec * 1000    // in ms
    });
    toastObj.show();
};

// ** Import & Call it like this **
// showToast('success', ....);
// showToast('fail', ....);
// showToast('error', ....);