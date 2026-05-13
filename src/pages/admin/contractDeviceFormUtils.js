const pickFirst = (...values) => values.find((value) => value !== undefined && value !== null && value !== '') || '';

const normalizeConfigurations = (device = {}) => {
  const rows = Array.isArray(device.configurations) ? device.configurations.filter(Boolean) : [];
  if (rows.length > 0) {
    return rows.map((row) => ({
      name: row.name || '',
      specification: pickFirst(row.specification, row.config, row.specs),
      serialNumber: pickFirst(row.serialNumber, row.serial, row.sn),
    }));
  }

  return [{
    name: device.config || device.specification ? 'Configuration' : '',
    specification: pickFirst(device.specification, device.config, device.specs),
    serialNumber: pickFirst(device.serialNumber, device.serial, device.sn),
  }];
};

export const normalizeContractDevice = (device, createBlankDevice, deviceTypes) => {
  const source = device && typeof device === 'object' ? device : {};
  const sourceType = source.type || source.deviceType;
  const type = deviceTypes.includes(sourceType) ? sourceType : 'Laptop';
  const blank = createBlankDevice(type);

  if (type === 'Laptop') {
    return {
      ...blank,
      ...source,
      type,
      configurations: normalizeConfigurations(source),
    };
  }

  if (type === 'Desktop' || type === 'Server') {
    return {
      ...blank,
      ...source,
      type,
      cpu: {
        ...blank.cpu,
        ...(source.cpu || {}),
        brand: pickFirst(source.cpu?.brand, source.brand),
        model: pickFirst(source.cpu?.model, source.model),
        config: pickFirst(source.cpu?.config, source.config),
        location: pickFirst(source.cpu?.location, source.location),
      },
      monitor: {
        ...blank.monitor,
        ...(source.monitor || {}),
        serialNumber: pickFirst(source.monitor?.serialNumber, source.serialNumber, source.serial, source.sn),
        location: pickFirst(source.monitor?.location, source.location),
      },
    };
  }

  if (type === 'Printer') {
    return {
      ...blank,
      ...source,
      type,
      model: pickFirst(source.model, source.brand),
      serialNumber: pickFirst(source.serialNumber, source.serial, source.sn),
      location: pickFirst(source.location, source.branch),
    };
  }

  if (type === 'CCTV') {
    const specs = Array.isArray(source.specs) && source.specs.length > 0
      ? source.specs
      : [pickFirst(source.specs, source.config, source.specification)];

    return {
      ...blank,
      ...source,
      type,
      serialNumber: pickFirst(source.serialNumber, source.serial, source.sn),
      specs,
    };
  }

  if (type === 'Total Maintenance') {
    const fallbackSubType = deviceTypes.find((entry) => entry !== 'Total Maintenance') || 'Laptop';
    const subDeviceType = source.subDeviceType && source.subDeviceType !== 'Total Maintenance'
      ? source.subDeviceType
      : fallbackSubType;

    return {
      ...blank,
      ...source,
      type,
      subDeviceType,
      subDeviceData: normalizeContractDevice(
        source.subDeviceData || { ...source, type: subDeviceType },
        createBlankDevice,
        deviceTypes
      ),
    };
  }

  return { ...blank, ...source, type };
};

export const normalizeContractDevices = (devices, createBlankDevice, deviceTypes) => {
  if (!Array.isArray(devices) || devices.length === 0) {
    return [createBlankDevice('Laptop')];
  }

  return devices.map((device) => normalizeContractDevice(device, createBlankDevice, deviceTypes));
};
