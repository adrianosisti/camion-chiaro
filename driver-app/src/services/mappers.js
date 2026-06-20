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
    vehicles: (data.vehicles ?? []).map(mapVehicle),
  }
}
