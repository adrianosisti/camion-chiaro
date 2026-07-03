const driverStatusLabels = {
  active: 'In servizio',
  archived: 'Archiviato',
  available: 'Disponibile',
  paused: 'Sospeso',
  travelling: 'In viaggio',
}

export function mapDriver(row = {}) {
  return {
    accessPassword: row.access_password ?? row.accessPassword ?? '',
    companyId: row.company_id ?? row.companyId ?? '',
    depot: row.depot ?? '',
    email: row.email ?? row.auth_email ?? '',
    id: row.id,
    name: row.full_name ?? row.name ?? 'Autista',
    phone: row.phone ?? '',
    profileImagePath: row.profile_image_path ?? row.profileImagePath ?? '',
    role: row.role ?? 'Autista',
    canSubmitChecks: row.can_submit_checks ?? row.canSubmitChecks ?? true,
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
    resolvedAt: row.resolved_at ?? row.resolvedAt ?? '',
    status: row.status ?? 'open',
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
    repairCostCents: Number(row.repair_cost_cents ?? row.repairCostCents ?? 0),
    repairCostCurrency: row.repair_cost_currency ?? row.repairCostCurrency ?? 'EUR',
    repairNotes: row.repair_notes ?? row.repairNotes ?? '',
    repairRecordedAt: row.repair_recorded_at ?? row.repairRecordedAt ?? '',
    repairRecordedBy: row.repair_recorded_by ?? row.repairRecordedBy ?? '',
    semitrailerId: row.semitrailer_id ?? row.semitrailerId ?? '',
    severity: row.severity ?? 'medium',
    status: row.status ?? 'open',
    title: row.title ?? 'Guasto',
    updatedAt: row.updated_at ?? row.updatedAt ?? '',
    vehicleId: row.vehicle_id ?? row.vehicleId ?? '',
  }
}

export function mapCostEntry(row = {}) {
  return {
    amountCents: Number(row.amount_cents ?? row.amountCents ?? 0),
    assetId: row.asset_id ?? row.assetId ?? '',
    category: row.category ?? 'maintenance',
    companyId: row.company_id ?? row.companyId ?? '',
    createdAt: row.created_at ?? row.createdAt ?? '',
    currency: row.currency ?? 'EUR',
    driverId: row.driver_id ?? row.driverId ?? '',
    fileBucket: row.file_bucket ?? row.fileBucket ?? '',
    filePath: row.file_path ?? row.filePath ?? '',
    id: row.id,
    notes: row.notes ?? '',
    odometerKm: row.odometer_km ?? row.odometerKm ?? '',
    sourceType: row.source_type ?? row.sourceType ?? 'manual',
    spentAt: row.spent_at ?? row.spentAt ?? '',
    supplier: row.supplier ?? '',
    title: row.title ?? 'Spesa',
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

export function mapTeamChatThread(row = {}) {
  return {
    audienceType: row.audience_type ?? row.audienceType ?? 'custom',
    companyId: row.company_id ?? row.companyId ?? '',
    createdAt: row.created_at ?? row.createdAt ?? '',
    directKey: row.direct_key ?? row.directKey ?? '',
    id: row.id,
    lastMessageAt: row.last_message_at ?? row.lastMessageAt ?? '',
    status: row.status ?? 'open',
    threadType: row.thread_type ?? row.threadType ?? 'group',
    title: row.title ?? 'Gruppo',
  }
}

export function mapTeamChatMessage(row = {}) {
  return {
    attachmentPath: row.attachment_path ?? row.attachmentPath ?? '',
    body: row.body ?? '',
    companyId: row.company_id ?? row.companyId ?? '',
    createdAt: row.created_at ?? row.createdAt ?? '',
    driverId: row.sender_person_id ?? row.senderPersonId ?? '',
    id: row.id,
    readByCompanyAt: row.read_by_company_at ?? row.readByCompanyAt ?? '',
    readByDriverAt: '',
    reactions: row.reactions ?? {},
    readCount: row.read_count ?? row.readCount ?? 0,
    senderName: row.sender_name ?? row.senderName ?? '',
    senderPersonId: row.sender_person_id ?? row.senderPersonId ?? '',
    senderRole: row.sender_role ?? row.senderRole ?? 'company',
    threadId: row.thread_id ?? row.threadId ?? '',
  }
}

export function mapVoiceCallSession(row = {}) {
  return {
    answeredAt: row.answered_at ?? row.answeredAt ?? '',
    callType: row.call_type ?? row.callType ?? 'voice',
    callerDriverId: row.caller_driver_id ?? row.callerDriverId ?? '',
    callerPersonId: row.caller_person_id ?? row.callerPersonId ?? '',
    callerRole: row.caller_role ?? row.callerRole ?? '',
    companyId: row.company_id ?? row.companyId ?? '',
    createdAt: row.created_at ?? row.createdAt ?? '',
    durationSeconds: Number(row.duration_seconds ?? row.durationSeconds ?? 0),
    endedAt: row.ended_at ?? row.endedAt ?? '',
    id: row.id,
    notes: row.notes ?? '',
    provider: row.provider ?? '',
    providerRoomId: row.provider_room_id ?? row.providerRoomId ?? '',
    receiverDriverId: row.receiver_driver_id ?? row.receiverDriverId ?? '',
    receiverPersonId: row.receiver_person_id ?? row.receiverPersonId ?? '',
    startedAt: row.started_at ?? row.startedAt ?? '',
    status: row.status ?? 'ringing',
    teamThreadId: row.team_thread_id ?? row.teamThreadId ?? '',
    threadId: row.thread_id ?? row.threadId ?? '',
    updatedAt: row.updated_at ?? row.updatedAt ?? '',
  }
}

export function mapCompanyPerson(row = {}) {
  return {
    accessPassword: row.access_password ?? row.accessPassword ?? '',
    authEmail: row.auth_email ?? row.authEmail ?? '',
    companyId: row.company_id ?? row.companyId ?? '',
    department: row.department ?? 'drivers',
    depot: row.depot ?? '',
    email: row.email ?? '',
    id: row.id,
    jobTitle: row.job_title ?? row.jobTitle ?? '',
    linkedDriverId: row.linked_driver_id ?? row.linkedDriverId ?? '',
    name: row.full_name ?? row.name ?? 'Persona',
    personType: row.person_type ?? row.personType ?? 'office',
    phone: row.phone ?? '',
    status: row.status ?? 'active',
    username: row.username ?? '',
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
    costEntries: (data.costEntries ?? []).map(mapCostEntry),
    faultReports: (data.faultReports ?? []).map(mapFaultReport),
    currentPerson: data.currentPerson ? mapCompanyPerson(data.currentPerson) : null,
    people: (data.people ?? []).map(mapCompanyPerson),
    teamChatThreads: (data.teamChatThreads ?? []).map(mapTeamChatThread),
    vehicleChecks: (data.vehicleChecks ?? []).map(mapVehicleCheck),
    vehicles: (data.vehicles ?? []).map(mapVehicle),
  }
}
