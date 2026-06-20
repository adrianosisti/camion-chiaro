const driverStatusLabels = {
  active: 'In servizio',
  archived: 'Archiviato',
  available: 'Disponibile',
  paused: 'Sospeso',
  travelling: 'In viaggio',
}

export function mapDriver(row = {}) {
  return {
    companyId: row.company_id ?? row.companyId ?? '',
    depot: row.depot ?? '',
    email: row.email ?? row.auth_email ?? '',
    id: row.id,
    name: row.full_name ?? row.name ?? 'Autista',
    phone: row.phone ?? '',
    profileImagePath: row.profile_image_path ?? row.profileImagePath ?? '',
    role: row.role ?? 'Autista',
    status: driverStatusLabels[row.status] ?? row.status ?? 'In servizio',
    username: row.username ?? '',
  }
}

export function mapVehicle(row = {}) {
  return {
    fleetType: row.fleet_type ?? row.fleetType ?? '',
    id: row.id,
    km: row.km ?? 0,
    model: row.model ?? '',
    plate: row.plate ?? '',
    status: row.status ?? '',
    type: row.type ?? '',
  }
}

export function mapDriverDocument(row = {}) {
  return {
    documentNumber: row.document_number ?? row.documentNumber ?? '',
    driverId: row.driver_id ?? row.driverId ?? '',
    expiresAt: row.expires_at ?? row.expiresAt ?? '',
    filePath: row.file_path ?? row.filePath ?? '',
    id: row.id,
    status: row.status ?? 'uploaded',
    type: row.type ?? 'Documento',
  }
}

export function mapVehicleCheck(row = {}) {
  return {
    companyId: row.company_id ?? row.companyId ?? '',
    createdAt: row.created_at ?? row.createdAt ?? '',
    documentsOnBoard: row.documents_on_board ?? row.documentsOnBoard ?? false,
    driverId: row.driver_id ?? row.driverId ?? '',
    id: row.id,
    lightsOk: row.lights_ok ?? row.lightsOk ?? false,
    notes: row.notes ?? '',
    odometerKm: row.odometer_km ?? row.odometerKm ?? 0,
    semitrailerId: row.semitrailer_id ?? row.semitrailerId ?? '',
    tiresOk: row.tires_ok ?? row.tiresOk ?? false,
    tractorId: row.tractor_id ?? row.tractorId ?? '',
  }
}

export function mapFaultReport(row = {}) {
  return {
    companyId: row.company_id ?? row.companyId ?? '',
    createdAt: row.created_at ?? row.createdAt ?? '',
    description: row.description ?? '',
    driverId: row.driver_id ?? row.driverId ?? '',
    id: row.id,
    photoPath: row.photo_path ?? row.photoPath ?? '',
    semitrailerId: row.semitrailer_id ?? row.semitrailerId ?? '',
    severity: row.severity ?? 'medium',
    status: row.status ?? 'open',
    title: row.title ?? 'Guasto',
    updatedAt: row.updated_at ?? row.updatedAt ?? '',
    vehicleId: row.vehicle_id ?? row.vehicleId ?? '',
  }
}

export function mapChatMessage(row = {}) {
  return {
    attachmentPath: row.attachment_path ?? row.attachmentPath ?? '',
    body: row.body ?? '',
    companyId: row.company_id ?? row.companyId ?? '',
    createdAt: row.created_at ?? row.createdAt ?? '',
    driverId: row.driver_id ?? row.driverId ?? '',
    id: row.id,
    readByCompanyAt: row.read_by_company_at ?? row.readByCompanyAt ?? '',
    readByDriverAt: row.read_by_driver_at ?? row.readByDriverAt ?? '',
    reactions: row.reactions ?? {},
    senderRole: row.sender_role ?? row.senderRole ?? 'driver',
    threadId: row.thread_id ?? row.threadId ?? '',
  }
}

export function mapChatThread(row = {}) {
  return {
    companyId: row.company_id ?? row.companyId ?? '',
    contextType: row.context_type ?? row.contextType ?? 'general',
    driverId: row.driver_id ?? row.driverId ?? '',
    id: row.id,
    lastMessageAt: row.last_message_at ?? row.lastMessageAt ?? '',
    title: row.title ?? 'Chat azienda',
  }
}

export function mapDriverContext(data = {}) {
  return {
    ...data,
    documents: (data.documents ?? []).map((entry) => ({
      ...entry,
      driverId: entry.driverId ?? entry.driver_id,
      expiresAt: entry.expiresAt ?? entry.expires_at,
      filePath: entry.filePath ?? entry.file_path,
    })),
    drivers: (data.drivers ?? []).map(mapDriver),
    faultReports: (data.faultReports ?? []).map(mapFaultReport),
    vehicleChecks: (data.vehicleChecks ?? []).map(mapVehicleCheck),
    vehicles: (data.vehicles ?? []).map(mapVehicle),
  }
}
