// Hàm để đảm bảo dữ liệu form luôn đầy đủ và có cấu trúc đúng
export const safeFormData = (initialData, defaultData) => {
  return {
    ...defaultData,
    ...initialData,
    workingHours: {
      ...defaultData.workingHours,
      ...(initialData?.workingHours || {})
    },
    location: initialData?.location || defaultData.location,
    services: initialData?.services || defaultData.services
  };
};

// Hàm để validate dữ liệu form trước khi submit
export const validateFormData = (formData) => {
  const errors = {};
  
  if (!formData.name?.trim()) {
    errors.name = 'Tên cơ sở y tế là bắt buộc';
  }
  
  if (!formData.address?.trim()) {
    errors.address = 'Địa chỉ là bắt buộc';
  }
  
  if (!formData.phone?.trim()) {
    errors.phone = 'Số điện thoại là bắt buộc';
  }
  
  if (!formData.type) {
    errors.type = 'Loại hình cơ sở là bắt buộc';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};