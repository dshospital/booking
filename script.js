(function() {
    const formContainer = document.querySelector('.booking-form-container-unique');
    if (!formContainer) return;

    const form = document.querySelector('form[name="submit-to-google-sheet"]');
    const statusDiv = formContainer.querySelector('#form-status');
    const nameInput = formContainer.querySelector('#name-input');

    // ****** استبدل هذا الرابط برابط Google Apps Script الخاص بإرسال بيانات الحجز ******
    const SUBMISSION_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXMRD3mhLydKBEsXDOe37nnqwRHyZBrYKs3nrkGRb1UD7TCzPc691pPhFYujwMOSgoaQ/exec'; 

    // ****** استبدل هذا الرابط برابط Google Apps Script الجديد الذي سيجلب الجداول ******
    const SCHEDULE_FETCH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGtEbxz9fyZ_LCJ5V80QlXSZNG7ZGZv8JIQXKcak0og-yyle_BpE3AVXTSI-AOXco/exec'; 

    const dateInput = formContainer.querySelector('#date-input');
    const dateError = formContainer.querySelector('#date-error');
    const clinicSelect = formContainer.querySelector('#clinic-select');
    const doctorSelect = formContainer.querySelector('#doctor-select');
    const timeInput = formContainer.querySelector('#time-input');
    
    // **ملاحظة: هذا هو المفتاح.** نحتاج إلى نسخة أصلية من جميع خيارات الأطباء قبل أي فلترة.
    // يتم أخذها مرة واحدة عند التحميل الأولي.
    const allDoctorOptions = Array.from(doctorSelect.options); 

    // عناصر البوب-أب
    const successPopup = document.getElementById('successPopup');
    const closePopupBtn = document.getElementById('closePopupBtn');
    const popupTitle = document.getElementById('popupTitle');

    // تعريف أوقات المناوبات المفصلة
    const SHIFT_TIMES = {
        "Shift_8AM_4PM": [
            { value: "08:00 AM", text: "08:00 صباحًا" }, { value: "08:15 AM", text: "08:15 صباحًا" }, { value: "08:30 AM", text: "08:30 صباحًا" }, { value: "08:45 AM", text: "08:45 صباحًا" },
            { value: "09:00 AM", text: "09:15 AM", text: "09:15 صباحًا" }, { value: "09:30 AM", text: "09:30 صباحًا" }, { value: "09:45 AM", text: "09:45 صباحًا" },
            { value: "10:00 AM", text: "10:15 AM", text: "10:15 صباحًا" }, { value: "10:30 AM", text: "10:30 صباحًا" }, { value: "10:45 AM", text: "10:45 صباحًا" },
            { value: "11:00 AM", text: "11:15 AM", text: "11:15 صباحًا" }, { value: "11:30 AM", text: "11:30 صباحًا" }, { value: "11:45 AM", text: "11:45 صباحًا" },
            { value: "12:00 PM", text: "12:15 PM", text: "12:15 ظهرًا" }, { value: "12:30 PM", text: "12:30 ظهرًا" }, { value: "12:45 PM", text: "12:45 ظهرًا" },
            { value: "01:00 PM", text: "01:15 PM", text: "01:15 ظهرًا" }, { value: "01:30 PM", text: "01:30 ظهرًا" }, { value: "01:45 PM", text: "01:45 ظهرًا" },
            { value: "02:00 PM", text: "02:15 PM", text: "02:15 ظهرًا" }, { value: "02:30 PM", text: "02:30 ظهرًا" }, { value: "02:45 PM", text: "02:45 ظهرًا" },
            { value: "03:00 PM", text: "03:15 PM", text: "03:15 ظهرًا" }, { value: "03:30 PM", text: "03:30 مساءً" }, { value: "03:45 PM", text: "03:45 مساءً" }
        ],
        "Shift_12PM_8PM": [
            { value: "12:00 PM", text: "12:00 ظهرًا" }, { value: "12:15 PM", text: "12:15 ظهرًا" }, { value: "12:30 PM", text: "12:30 ظهرًا" }, { value: "12:45 PM", text: "12:45 ظهرًا" },
            { value: "01:00 PM", text: "01:15 PM", text: "01:15 ظهرًا" }, { value: "01:30 PM", text: "01:30 ظهرًا" }, { value: "01:45 PM", text: "01:45 ظهرًا" },
            { value: "02:00 PM", text: "02:15 PM", text: "02:15 ظهرًا" }, { value: "02:30 PM", text: "02:30 ظهرًا" }, { value: "02:45 PM", text: "02:45 ظهرًا" },
            { value: "03:00 PM", text: "03:15 PM", text: "03:15 ظهرًا" }, { value: "03:30 PM", text: "03:30 ظهرًا" }, { value: "03:45 PM", text: "03:45 ظهرًا" },
            { value: "04:00 PM", text: "04:15 PM", text: "04:15 مساءً" }, { value: "04:30 PM", text: "04:30 مساءً" }, { value: "04:45 PM", text: "04:45 مساءً" },
            { value: "05:00 PM", text: "05:15 PM", text: "05:15 مساءً" }, { value: "05:30 PM", text: "05:30 مساءً" }, { value: "05:45 PM", text: "05:45 مساءً" },
            { value: "06:00 PM", text: "06:15 PM", text: "06:15 مساءً" }, { value: "06:30 PM", text: "06:30 مساءً" }, { value: "06:45 PM", text: "06:45 مساءً" },
            { value: "07:00 PM", text: "07:15 PM", text: "07:15 مساءً" }, { value: "07:30 PM", text: "07:30 مساءً" }, { value: "07:45 PM", text: "07:45 مساءً" }
        ],
        "Shift_1PM_9PM": [
            { value: "01:00 PM", text: "01:00 ظهرًا" }, { value: "01:15 PM", text: "01:15 ظهرًا" }, { value: "01:30 PM", text: "01:30 ظهرًا" }, { value: "01:45 PM", text: "01:45 ظهرًا" },
            { value: "02:00 PM", text: "02:15 PM", text: "02:15 ظهرًا" }, { value: "02:30 PM", text: "02:30 ظهرًا" }, { value: "02:45 PM", text: "02:45 ظهرًا" },
            { value: "03:00 PM", text: "03:15 PM", text: "03:15 ظهرًا" }, { value: "03:30 PM", text: "03:30 ظهرًا" }, { value: "03:45 PM", text: "03:45 ظهرًا" },
            { value: "04:00 PM", text: "04:15 PM", text: "04:15 مساءً" }, { value: "04:30 PM", text: "04:30 مساءً" }, { value: "04:45 PM", text: "04:45 مساءً" },
            { value: "05:00 PM", text: "05:15 PM", text: "05:15 مساءً" }, { value: "05:30 PM", text: "05:30 مساءً" }, { value: "05:45 PM", text: "05:45 مساءً" },
            { value: "06:00 PM", text: "06:15 PM", text: "06:15 مساءً" }, { value: "06:30 PM", text: "06:30 مساءً" }, { value: "06:45 PM", text: "06:45 مساءً" },
            { value: "07:00 PM", text: "07:15 PM", text: "07:15 مساءً" }, { value: "07:30 PM", text: "07:30 مساءً" }, { value: "07:45 PM", text: "07:45 مساءً" },
            { value: "08:00 PM", text: "08:15 PM", text: "08:15 مساءً" }, { value: "08:30 PM", text: "08:30 مساءً" }, { value: "08:45 PM", text: "08:45 مساءً" }
        ],
        "Shift_4PM_12AM": [
            { value: "04:00 PM", text: "04:00 مساءً" }, { value: "04:15 PM", text: "04:15 مساءً" }, { value: "04:30 PM", text: "04:30 مساءً" }, { value: "04:45 PM", text: "04:45 مساءً" },
            { value: "05:00 PM", text: "05:15 PM", text: "05:15 مساءً" }, { value: "05:30 PM", text: "05:30 مساءً" }, { value: "05:45 PM", text: "05:45 مساءً" },
            { value: "06:00 PM", text: "06:15 PM", text: "06:15 مساءً" }, { value: "06:30 PM", text: "06:30 مساءً" }, { value: "06:45 PM", text: "06:45 مساءً" },
            { value: "07:00 PM", text: "07:15 PM", text: "07:15 مساءً" }, { value: "07:30 PM", text: "07:30 مساءً" }, { value: "07:45 PM", text: "07:45 مساءً" },
            { value: "08:00 PM", text: "08:15 PM", text: "08:15 مساءً" }, { value: "08:30 PM", text: "08:30 مساءً" }, { value: "08:45 PM", text: "08:45 مساءً" },
            { value: "09:00 PM", text: "09:15 PM", text: "09:15 مساءً" }, { value: "09:30 PM", text: "09:30 مساءً" }, { value: "09:45 PM", text: "09:45 مساءً" },
            { value: "10:00 PM", text: "10:15 PM", text: "10:15 مساءً" }, { value: "10:30 PM", text: "10:30 مساءً" }, { value: "10:45 PM", text: "10:45 مساءً" },
            { value: "11:00 PM", text: "11:15 PM", text: "11:15 مساءً" }, { value: "11:30 PM", text: "11:30 مساءً" }, { value: "11:45 PM", text: "11:45 مساءً" }
        ],
        "Morning_8AM_12PM": [
            { value: "08:00 AM", text: "08:00 صباحًا" }, { value: "08:15 AM", text: "08:15 صباحًا" }, { value: "08:30 AM", text: "08:30 صباحًا" }, { value: "08:45 AM", text: "08:45 صباحًا" },
            { value: "09:00 AM", text: "09:15 AM", text: "09:15 صباحًا" }, { value: "09:30 AM", text: "09:30 صباحًا" }, { value: "09:45 AM", text: "09:45 صباحًا" },
            { value: "10:00 AM", text: "10:15 AM", text: "10:15 صباحًا" }, { value: "10:30 AM", text: "10:30 صباحًا" }, { value: "10:45 AM", text: "10:45 صباحًا" },
            { value: "11:00 AM", text: "11:15 AM", text: "11:15 صباحًا" }, { value: "11:30 AM", text: "11:30 صباحًا" }, { value: "11:45 AM", text: "11:45 صباحًا" }
        ],
        "Evening_4PM_10PM": [
            { value: "04:00 PM", text: "04:15 PM", text: "04:15 مساءً" }, { value: "04:30 PM", text: "04:30 مساءً" }, { value: "04:45 PM", text: "04:45 مساءً" },
            { value: "05:00 PM", text: "05:15 PM", text: "05:15 مساءً" }, { value: "05:30 PM", text: "05:30 مساءً" }, { value: "05:45 PM", text: "05:45 مساءً" },
            { value: "06:00 PM", text: "06:15 PM", text: "06:15 مساءً" }, { value: "06:30 PM", text: "06:30 مساءً" }, { value: "06:45 PM", text: "06:45 مساءً" },
            { value: "07:00 PM", text: "07:15 PM", text: "07:15 مساءً" }, { value: "07:30 PM", text: "07:30 مساءً" }, { value: "07:45 PM", text: "07:45 مساءً" },
            { value: "08:00 PM", text: "08:15 PM", text: "08:15 مساءً" }, { value: "08:30 PM", text: "08:30 مساءً" }, { value: "08:45 PM", text: "08:45 مساءً" },
            { value: "09:00 PM", text: "09:15 PM", text: "09:15 مساءً" }, { value: "09:30 PM", text: "09:30 مساءً" }, { value: "09:45 PM", text: "09:45 مساءً" }
        ]
    };

    // دالة لإعادة تهيئة حقل اختيار التاريخ (وضع الحد الأدنى وتصفير القيمة)
    function setupDatePicker() {
        const today = new Date();
        const offset = today.getTimezoneOffset();
        const todayLocal = new Date(today.getTime() - (offset * 60 * 1000));
        const minDate = todayLocal.toISOString().split('T')[0];
        
        dateInput.setAttribute('min', minDate);
        dateInput.value = '';
        dateError.textContent = '';
        timeInput.innerHTML = '<option value="" disabled selected>-- اختر --</option>';
    }

    // دالة لفلترة الأطباء بناءً على العيادة المختارة
    function filterDoctors() {
        const selectedClinic = clinicSelect.value;
        doctorSelect.innerHTML = ''; // مسح الخيارات الحالية

        const firstOption = allDoctorOptions.find(option => option.disabled);
        doctorSelect.appendChild(firstOption);
        firstOption.textContent = '-- اختر الطبيب --';
        firstOption.selected = true;

        // **هنا يتم فلترة الأطباء**
        allDoctorOptions.forEach(option => {
            // هذا الشرط يتحقق من أن الطبيب ينتمي للعيادة المختارة
            if (option.dataset.clinic === selectedClinic) {
                doctorSelect.appendChild(option);
            }
        });
        
        // إعادة ضبط التاريخ والوقت بعد تغيير العيادة
        setupDatePicker(); 
        updateAvailableTimes(); 
    }

    // دالة لإعادة قائمة الأطباء إلى حالتها الأولية
    function resetDoctorList() {
        doctorSelect.innerHTML = '';
        const initialDefaultOption = document.createElement('option');
        initialDefaultOption.value = "";
        initialDefaultOption.disabled = true;
        initialDefaultOption.selected = true;
        initialDefaultOption.textContent = '-- الرجاء اختيار العيادة أولاً --';
        doctorSelect.appendChild(initialDefaultOption);

        // **في هذه الدالة، بعد إعادة تعيين القائمة، يتم استدعاء filterDoctors()**
        // والتي بدورها ستجعل قائمة الأطباء فارغة (عدا الخيار الافتراضي) إذا لم يتم اختيار عيادة بعد.
        filterDoctors(); 
        setupDatePicker();
    }

    // دالة لجلب الجدولة من Google Apps Script
    async function fetchDoctorSchedule(date, clinic, doctor) {
        if (!SCHEDULE_FETCH_SCRIPT_URL || SCHEDULE_FETCH_SCRIPT_URL.trim() === '') {
            console.error("SCHEDULE_FETCH_SCRIPT_URL is not set or is empty after trim.");
            statusDiv.textContent = 'خطأ في إعداد الجدولة: رابط API غير صحيح أو فارغ.'; 
            statusDiv.style.color = 'red';
            return { shifts: [], status: 'Error' };
        }

        try {
            const url = `${SCHEDULE_FETCH_SCRIPT_URL}?date=${encodeURIComponent(date)}&clinic=${encodeURIComponent(clinic)}&doctor=${encodeURIComponent(doctor)}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            statusDiv.textContent = 'حدث خطأ أثناء جلب الجدولة. يرجى المحاولة مرة أخرى.';
            statusDiv.style.color = 'red';
            return { shifts: [], status: 'Error' };
        }
    }

    // دالة لتحديث الأوقات المتاحة بناءً على الطبيب والتاريخ
    async function updateAvailableTimes() {
        const selectedClinic = clinicSelect.value;
        const selectedDoctor = doctorSelect.value;
        const selectedDate = dateInput.value;
        timeInput.innerHTML = '<option value="" disabled selected>-- اختر --</option>';

        if (!selectedClinic || !selectedDoctor || !selectedDate) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "-- اختر --";
            option.disabled = true;
            option.selected = true;
            timeInput.appendChild(option);
            return;
        }

        const dateObj = new Date(selectedDate + 'T00:00:00Z');
        const dayOfWeek = dateObj.getUTCDay();
        if (dayOfWeek === 5) { // الجمعة
            dateError.textContent = 'عذراً، الحجز غير متاح في عطلة نهاية الأسبوع (الجمعة).';
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "-- لا توجد أوقات في يوم الجمعة --";
            option.disabled = true;
            timeInput.appendChild(option);
            return;
        } else {
            dateError.textContent = '';
        }

        const scheduleData = await fetchDoctorSchedule(selectedDate, selectedClinic, selectedDoctor);
        
        if (scheduleData.status === 'Error') {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "-- خطأ في جلب المواعيد --";
            option.disabled = true;
            timeInput.appendChild(option);
            return;
        }

        const availableShiftTypes = scheduleData.shifts;
        const doctorStatus = scheduleData.status;

        let availableTimes = [];

        if (doctorStatus === 'OFF') {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "-- الطبيب في إجازة في هذا التاريخ --";
            option.disabled = true;
            timeInput.appendChild(option);
        } else if (availableShiftTypes && availableShiftTypes.length > 0) {
            availableShiftTypes.forEach(shiftType => {
                if (SHIFT_TIMES[shiftType]) {
                    availableTimes = availableTimes.concat(SHIFT_TIMES[shiftType]);
                }
            });

            availableTimes.sort((a, b) => {
                const parseTime = (timeStr) => {
                    const [time, period] = timeStr.split(' ');
                    let [hours, minutes] = time.split(':').map(Number);
                    if (period === 'PM' && hours < 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    return hours * 60 + minutes;
                };
                return parseTime(a.value) - parseTime(b.value);
            });

            if (availableTimes.length > 0) {
                const uniqueTimes = Array.from(new Map(availableTimes.map(item => [item.value, item])).values());
                uniqueTimes.forEach(time => {
                    const option = document.createElement('option');
                    option.value = time.value;
                    option.textContent = time.text;
                    timeInput.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "-- لا توجد أوقات متاحة لهذا الطبيب في هذا اليوم --";
                option.disabled = true;
                timeInput.appendChild(option);
            }
        } else {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "-- لا تتوفر معلومات جدول لهذا الطبيب في هذا اليوم --";
            option.disabled = true;
            timeInput.appendChild(option);
        }
    }

    // دالة لعرض البوب-أب
    function showSuccessPopup(firstName) {
        popupTitle.textContent = `عزيزي ${firstName}، تم إنشاء طلب حجز موعد.`;
        successPopup.classList.add('show');
    }

    // دالة لإخفاء البوب-أب
    function hideSuccessPopup() {
        successPopup.classList.remove('show');
    }

    // معالج حدث لإرسال النموذج
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'جاري الإرسال...';
        statusDiv.textContent = '';

        const fullName = nameInput.value.trim();
        const firstName = fullName.split(' ')[0];

        try {
            const response = await fetch(SUBMISSION_SCRIPT_URL, { method: 'POST', body: new FormData(form) });
            const data = await response.json();
            
            if (data.result === 'success') {
                showSuccessPopup(firstName);
                form.reset();
                setupDatePicker();
                resetDoctorList();
            } else {
                throw new Error(data.error || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error('Error!', error.message);
            statusDiv.textContent = 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.';
            statusDiv.style.color = 'red';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'احجز الآن';
        }
    });

    // معالجات أحداث البوب-أب
    closePopupBtn.addEventListener('click', hideSuccessPopup);
    successPopup.addEventListener('click', (e) => {
        if (e.target === successPopup) {
            hideSuccessPopup();
        }
    });

    // معالج حدث عند تغيير التاريخ
    dateInput.addEventListener('change', updateAvailableTimes);
    
    // معالج حدث عند تغيير العيادة
    clinicSelect.addEventListener('change', filterDoctors); 

    // معالج حدث عند تغيير الطبيب
    doctorSelect.addEventListener('change', updateAvailableTimes);

    // عند تحميل الصفحة لأول مرة:
    document.addEventListener('DOMContentLoaded', function() {
        setupDatePicker();
        resetDoctorList();
    });
})();
