import type { Reservation, Room, User, ApiError } from "../types/index";

const API_URL = "http://localhost:5080/api";

export async function getRooms(token: string): Promise<Room[]> {
	const response = await fetch(`${API_URL}/rooms`, {
		method: "GET",
		headers: {
			Autorization: `Bearer ${token}`,

		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch rooms (${response.status})`);
	}
	return response.json() as Promise<Room[]>;
}

export async function confirmReservation(reservation: Reservation): Promise<Object | null> {
	const response = await fetch(`${API_URL}/reservations`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(reservation),
	});

	const result = await response.text();

	if (!response.ok) {
		throw new ApiError(result);
	}

	return result ? JSON.parse(result) : null;
}


export async function getUsers(token: string): Promise<User[]> {
	const response = await fetch(`${API_URL}/admin/users`, {
		method: "GET",
		headers: {
			AUthorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch users (${response.status})`);
	}

	return response.json() as Promise<User[]>;

}

export async function getReservations(token: string): Promise<Reservation[]> {
	const response = await fetch(`${API_URL}/admin/reservations`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch users (${response.status})`);
	}

	return response.json() as Promise<Reservation[]>;

}

export async function cancelReservation({ token, id} : {token: string, id: number}) {
	const response = await fetch(`${API_URL}/admin/reservations/${id}/cancel`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
        });
	if (!response.ok) {
		throw new Error("Failed to delete reservation");
	}

	return await response.json();
}

export async function endReservationEarly({ token, id }: { token: string, id: number }) {
        const response = await fetch(`${API_URL}/admin/reservations/${id}/end-early`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.text();
        if (!response.ok) throw new Error("Failed to end the reservation early.");
        return result ? JSON.parse(result) : null;
}