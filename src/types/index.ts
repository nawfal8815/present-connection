export interface User {
	id: number,
	email: string,
	displayName: string,
	isDisabled: boolean,
	activeReservations: number,
}

export interface Room {
	id: number,
	capacity: number,
	floor: number,
	name: string,
	equipment: string[],
	isActive: boolean
}

export interface Reservation {
	id: number | null,
	roomId: number,
	userId: string,
	startTime: string,
	endTime: string,
	attendees: number,
	status: number,
	title: string,
}

export class ApiError extends Error {
    code?: string;
    conflicts?: { startTime: string; endTime: string }[];
}
