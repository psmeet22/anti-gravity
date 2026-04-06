/**
 * Employee Management System - Logic & State Management
 * Includes: CRUD operations, UI updates, and validation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 🧠 1. Data Model & State
    let employees = [
        { id: "EMP101", name: "Sarah Williams", salary: 7500, gender: "Female" },
        { id: "EMP102", name: "James Anderson", salary: 8200, gender: "Male" },
        { id: "EMP103", name: "Emily Chen", salary: 6900, gender: "Female" },
        { id: "EMP104", name: "David Miller", salary: 5400, gender: "Male" },
        { id: "EMP105", name: "Jordan Smith", salary: 6100, gender: "Other" }
    ];

    // 🏗️ 2. DOM Elements
    const form = document.getElementById('employeeForm');
    const tableBody = document.getElementById('employeeTableBody');
    const emptyState = document.getElementById('emptyState');
    const totalCountEl = document.getElementById('totalCount');
    const avgSalaryEl = document.getElementById('avgSalary');
    const toastContainer = document.getElementById('toastContainer');
    const editSalaryModal = new bootstrap.Modal(document.getElementById('editSalaryModal'));
    const editSalaryForm = document.getElementById('editSalaryForm');
    const editEmpIdInput = document.getElementById('editEmpId');
    const editEmpNameDisplay = document.getElementById('editEmpNameDisplay');
    const editEmpSalaryInput = document.getElementById('editEmpSalary');

    // 🚀 3. Initial Load
    renderEmployees();

    // 🏷️ 4. Form Submission Logic
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Reset validation UI
        form.classList.remove('was-validated');
        const empIdInput = document.getElementById('empId');
        empIdInput.classList.remove('is-invalid');

        // Capture Form Data
        const empId = empIdInput.value.trim().toUpperCase();
        const empName = document.getElementById('empName').value.trim();
        const empSalary = parseFloat(document.getElementById('empSalary').value);
        const genderInput = document.querySelector('input[name="empGender"]:checked');
        const empGender = genderInput ? genderInput.value : null;

        // Validation Logic
        let isValid = true;

        // Check Unique ID
        if (employees.some(emp => emp.id === empId)) {
            empIdInput.classList.add('is-invalid');
            document.getElementById('empIdError').textContent = "ID already exists. Please use a unique ID.";
            isValid = false;
        }

        // Bootstrap Native Validation
        if (!form.checkValidity() || !isValid) {
            form.classList.add('was-validated');
            return;
        }

        // Add to Array
        const newEmployee = {
            id: empId,
            name: empName,
            salary: empSalary,
            gender: empGender
        };

        employees.push(newEmployee);

        // Success Feedback
        showToast(`Employee ${empName} added successfully!`, 'success');
        
        // UI Updates
        form.reset();
        form.classList.remove('was-validated');
        renderEmployees();
    });

    // 🏗️ 4.1 Edit Salary Logic
    editSalaryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const empId = editEmpIdInput.value;
        const newSalary = parseFloat(editEmpSalaryInput.value);

        if (isNaN(newSalary) || newSalary <= 0) {
            showToast("Please enter a valid salary amount.", "error");
            return;
        }

        const empIndex = employees.findIndex(emp => emp.id === empId);
        if (empIndex !== -1) {
            employees[empIndex].salary = newSalary;
            showToast(`Updated salary for ${employees[empIndex].name} to $${newSalary.toLocaleString()}`, 'success');
            editSalaryModal.hide();
            renderEmployees();
        }
    });

    // 🖥️ 5. Render Functions
    function renderEmployees() {
        tableBody.innerHTML = '';

        if (employees.length === 0) {
            emptyState.classList.remove('d-none');
            tableBody.closest('table').classList.add('d-none');
        } else {
            emptyState.classList.add('d-none');
            tableBody.closest('table').classList.remove('d-none');

            // Formatters
            const currencyFormatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            });

            employees.forEach((emp, index) => {
                const tr = document.createElement('tr');
                tr.className = 'animate-fade-in';
                tr.style.animationDelay = `${(index * 0.05).toFixed(2)}s`;

                tr.innerHTML = `
                    <td><span class="fw-bold text-primary">${emp.id}</span></td>
                    <td>
                        <div class="d-flex flex-column">
                            <span class="fw-semibold">${emp.name}</span>
                            <span class="text-muted small">$${emp.salary.toLocaleString()} Monthly</span>
                        </div>
                    </td>
                    <td><span class="text-secondary">${currencyFormatter.format(emp.salary)}</span></td>
                    <td>
                        <span class="badge-gender badge-${emp.gender.toLowerCase()}">${emp.gender}</span>
                    </td>
                    <td class="text-end">
                        <div class="d-flex justify-content-end gap-2">
                            <button class="btn-action btn-edit" onclick="window.prepareEditSalary('${emp.id}')" title="Edit Salary">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-delete" onclick="window.deleteEmployee('${emp.id}')" title="Delete Employee">
                                <i class="fas fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }

        updateStats();
    }

    // 🏗️ 5.1 Global Action Handlers (Exposure for Click Events)
    window.prepareEditSalary = (id) => {
        const emp = employees.find(e => e.id === id);
        if (emp) {
            editEmpIdInput.value = emp.id;
            editEmpNameDisplay.textContent = emp.name;
            editEmpSalaryInput.value = emp.salary;
            editSalaryModal.show();
        }
    };

    window.deleteEmployee = (id) => {
        const emp = employees.find(e => e.id === id);
        if (emp && confirm(`Are you sure you want to delete ${emp.name}?`)) {
            employees = employees.filter(e => e.id !== id);
            showToast(`Employee ${emp.name} removed successfully!`, 'success');
            renderEmployees();
        }
    };

    // 📊 6. Stats Management
    function updateStats() {
        const total = employees.length;
        totalCountEl.textContent = total;

        if (total > 0) {
            const sum = employees.reduce((acc, current) => acc + current.salary, 0);
            const avg = sum / total;
            avgSalaryEl.textContent = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            }).format(avg);
        } else {
            avgSalaryEl.textContent = '$0';
        }
    }

    // 🍞 7. UI Notifications (Toasts)
    function showToast(message, type = 'success') {
        const toastId = `toast-${Date.now()}`;
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'success' ? 'primary' : 'danger'} border-0" role="alert" aria-live="assertive" aria-atomic="true">
              <div class="d-flex">
                <div class="toast-body">
                  <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2"></i>
                  ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
              </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        toast.show();

        // Remove from DOM after hide
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
});
