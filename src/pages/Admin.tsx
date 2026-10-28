import { auth } from "../services/firebase";
import { getReservations, getRooms, getUsers } from "../services/roomServices";
import type { Reservation, Room, User } from "../types/index";
import { useState, useEffect } from "react";
import { cancelReservation, endReservationEarly } from "../services/roomServices";
import { ReservationModal } from "../components/ReservationModal";

export function Admin() {
    const [users, setUsers] = useState<User[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const status = ["Default", "Completed", "Booked", "Cancelled"];
    const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);
    const [reservationToEndEarly, setReservationToEndEarly] = useState<number | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);
    const [reservationAddModal, setReservationAddModal] = useState<boolean>(false);
    const [reservationModal, setReservationModal] = useState<boolean>(false);
    const [addedUserId, setAddedUserId] = useState<string>("");
    const [userSearch, setUserSearch] = useState<string>("");
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [actionError, setActionError] = useState("");
    const isInProgress = (r: Reservation) => {
        const now = new Date();
        return r.status === 2 && new Date(r.startTime) <= now && now < new Date(r.endTime);
    };

    const filteredUsers = users.filter((user) =>
        String(user.id).toLowerCase().includes(userSearch.trim().toLowerCase())
    );


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;

            if (!user) {
                setError("You must be signed in.");
                return;
            }
            const token = await user.getIdToken(true);
            const response = await getUsers(token);

            const data: User[] = response;
            setUsers(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch users."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;

            if (!user) {
                setError("You must be signed in.");
                return;
            }

            const tokenResult = await user?.getIdTokenResult();
            const token = tokenResult?.token;

            const response = await getReservations(token);
            const data: Reservation[] = response;
            setReservations(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch reservations."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomsNames = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;

            if (!user) {
                setError("You must be signed in.");
                return;
            }

            const token = await user?.getIdToken();

            const response = await getRooms(token);
            const data: Room[] = response;
            setRooms(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch rooms names."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoomsNames();
        fetchReservations();
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!addedUserId || selectedRoom === null) return;
        setReservationAddModal(false);
        setReservationModal(true);
    };

    const handleConfirmationAction = async () => {
        if (processing) return;
        setProcessing(true);
        setActionError("");
        try {
            const user = auth.currentUser;
            if (!user) {
                setActionError("You must be signed in.");
                return;
            }
            const token = await user.getIdToken(true);

            if (reservationToDelete !== null) {
                await cancelReservation({ token, id: reservationToDelete });
            } else if (reservationToEndEarly !== null) {
                await endReservationEarly({ token, id: reservationToEndEarly });
            }
            setReservationToDelete(null);
            setReservationToEndEarly(null);
            await fetchReservations(); // refresh

        } catch (error) {
            setActionError(error instanceof Error ? error.message : reservationToDelete != null ? "Failed to delete" : "Failed to end early");
        } finally {
            setProcessing(false);
        }
    }

    if (loading) return <p className="text-second">Loading...</p>;

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="rounded-xl border border-border bg-surface px-6 py-4 text-text">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-background p-6 text-text">
                <h1 className="mb-4 text-2xl font-semibold">Users</h1>

                {users.map((user) => (
                    <div key={user.id} className="mb-3 rounded-lg border border-border bg-surface p-4">
                        <span className="text-extra">ID:</span> {user.id} | <span className="text-extra">Full name:</span> {user.displayName} <span className="text-extra">Active reservations:</span> {user.activeReservations}
                    </div>
                ))}
            </div>

            <div className="bg-background p-6 text-text">
                <h1 className="mb-4 text-2xl font-semibold">Reservations</h1>

                {reservations.length > 0 && reservations.map((reservation) => (
                    <div key={reservation.id}>
                        <div className="mb-3 rounded-lg border border-border relative bg-surface p-4">
                            Room ID: {reservation.roomId}
                            <br />
                            User ID: {reservation.userId}
                            <br />
                            Attendees: {reservation.attendees}
                            <br />
                            Start time: {reservation.startTime}
                            <br />
                            End time: {reservation.endTime}
                            <br />
                            Status: {status[reservation.status]}
                            <br />
                            Title: {reservation.title}
                            {
                                reservation.status === 2 &&
                                <button onClick={() => setReservationToDelete(reservation.id)} className="absolute right-4 top-4 rounded-lg bg-extra px-4 py-2 text-sm font-semibold text-text border border-border shadow-sm transition-colors duration-200 hover:bg-border">Delete the reservation</button>
                            }
                            {
                                isInProgress(reservation) &&
                                <button onClick={() => setReservationToEndEarly(reservation.id)} className="absolute right-4 top-14 rounded-lg bg-extra px-4 py-2 text-sm font-semibold text-text border border-border shadow-sm transition-colors duration-200 hover:bg-border">End Early</button>
                            }
                        </div>
                    </div>
                ))
                }
                <button onClick={() => setReservationAddModal(true)} className="mb-4 w-full md:absolute md:right-4 md:top-4 md:mb-0 md:w-auto rounded-lg bg-main px-4 py-2 text-sm font-semibold text-text border border-border shadow-sm transition-colors duration-200 hover:bg-border">Add new reservation</button>
                {!reservations.length &&
                    <div className="flex min-h-32 items-center justify-center bg-background">
                        <p className="rounded-xl border border-border bg-surface px-6 py-4 text-text">
                            No reservations yet.
                        </p>
                    </div>
                }
                {(reservationToDelete || reservationToEndEarly) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl">
                            <h2 className="text-xl font-semibold">
                                {reservationToEndEarly != null ? "End Early" : "Delete reservation?"}
                            </h2>

                            <p className="mt-3 text-sm text-gray-500">
                                Are you sure you want to {reservationToDelete != null ? "delete" : "end early"} this reservation? This action cannot be undone.
                            </p>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => {
                                        setReservationToDelete(null);
                                        setReservationToEndEarly(null);
                                        setActionError("");
                                    }}
                                    className="rounded-lg border border-border px-4 py-2 disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={processing}
                                    onClick={handleConfirmationAction}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                    {processing ? "Please wait..." : "Confirm"}
                                </button>
                            </div>
                            {actionError && <p role="alert" className="mt-3 text-sm text-red-400">{actionError}</p>}
                        </div>
                    </div>
                )}
                {reservationAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl">
                                <h2 className="text-xl font-semibold">
                                    Adding new reservation
                                </h2>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text">
                                        User:
                                    </label>
                                    <input
                                        maxLength={200}
                                        value={userSearch}
                                        onChange={(event) => setUserSearch(event.target.value)}
                                        placeholder="Search by user ID"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-text outline-none focus:border-main"
                                    />
                                    <select
                                        required
                                        value={addedUserId}
                                        onChange={(e) => setAddedUserId(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-surface px-4 py-2 my-2"
                                    >
                                        <option value="">Select a user</option>
                                        {filteredUsers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {`${user.displayName || user.email} (${user.id})`}
                                            </option>
                                        ))}
                                    </select>
                                    {rooms.length > 0 && (
                                        <select
                                            value={selectedRoom?.id ?? ""}
                                            onChange={(e) =>
                                                setSelectedRoom(rooms.find((room) => room.id === Number(e.target.value)) ?? null)
                                            }
                                            className="rounded-lg border border-border bg-surface px-4 py-2 my-2"
                                        >
                                            <option value="">Select a room</option>
                                            {rooms.map((room) => (
                                                <option key={room.id} value={room.id} disabled={!room.isActive}>
                                                    {`${room.name}, ${room.capacity} capacity`}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReservationAddModal(false);
                                            setSelectedRoom(null);
                                            setAddedUserId("");
                                            setUserSearch("");
                                        }}
                                        className="rounded-lg border border-border px-4 py-2"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="rounded-lg border bg-extra border-border px-4 py-2"
                                    >
                                        Open Adding form
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
                {reservationModal && selectedRoom && (
                    <ReservationModal
                        room={selectedRoom}
                        userId={addedUserId}
                        onClose={() => {
                            setReservationModal(false);
                            setSelectedRoom(null);
                            setAddedUserId("");
                            setUserSearch("");
                            fetchReservations();
                        }}
                    />
                )}
            </div>
        </>
    );
}
