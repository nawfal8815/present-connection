
import { useEffect, useState } from "react";
import { getRooms } from "../services/roomServices";
import { ReservationModal } from "./ReservationModal";
import type { Room } from "../types/index";
import { auth } from "../services/firebase";

export default function RoomList() {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
	const userId = auth.currentUser?.uid;
	

	if (!userId) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<p className="rounded-xl border border-border bg-surface px-6 py-4 text-second">
					Missing user's ID...
				</p>
			</div>
		);
	}

	async function loadRooms(cancelled: boolean) {
		try {
			setLoading(true);
			setError(null);
			const user = auth?.currentUser;
			if (!user) {
                setError("You must be signed in.");
                return;
            }
			const token = await user.getIdToken(true);
			const data = await getRooms(token);

			if (!cancelled) {
				setRooms(data);
			}
		} catch (err) {
			if (!cancelled) {
				setError(
					err instanceof Error ? err.message : "Unable to load rooms."
				);
			}
		} finally {
			if (!cancelled) setLoading(false);
		}
	}

	useEffect(() => {
		let cancelled = false;

		void loadRooms(cancelled);

		return () => {
			cancelled = true;
		};
	}, []);

	const handleBooking = (room: Room) => {
		if (!room.isActive) return;
		setSelectedRoom(room);
	};

	if (loading) {
		return (
			<div className="flex min-h-64 items-center justify-center bg-background px-6">
				<div className="flex items-center gap-3">
					<span className="h-2.5 w-2.5 animate-pulse rounded-full bg-extra" />
					<p className="animate-pulse text-sm font-medium text-second">
						Loading rooms...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-full bg-background p-6 md:p-10">
				<div
					role="alert"
					className="mx-auto max-w-3xl rounded-2xl border border-red-400/20 bg-red-500/10 p-6 text-red-200"
				>
					<p className="font-semibold">Unable to load rooms</p>
					<p className="mt-2 text-sm">{error}</p>
					<p className="mt-3 text-sm text-red-200/70">
						Check that your ASP.NET backend is running on port 5080.
					</p>
				</div>
			</div>
		);
	}

	if (rooms.length === 0) {
		return (
			<div className="flex min-h-64 items-center justify-center bg-background px-6">
				<div className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface">
						<span className="text-xl text-extra">⌂</span>
					</div>
					<p className="font-medium text-text">No rooms found.</p>
					<p className="mt-1 text-sm text-second">
						Available meeting rooms will appear here.
					</p>
				</div>
			</div>
		);
	}

	const activeRooms = rooms.filter((room) => room.isActive).length;

	return (
		<section className="min-h-full bg-background px-6 py-10 md:px-12">
			<div className="mx-auto max-w-7xl">
				<header className="mb-8">
					<div className="mb-3 flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-extra" />
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet">
							Workspace
						</p>
					</div>

					<h1 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
						Meeting rooms
					</h1>

					<p className="mt-3 max-w-2xl leading-relaxed text-second">
						Find the right space for your next meeting.
					</p>
				</header>

				<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
					<p className="text-sm text-second">
						<span className="font-semibold text-text">{rooms.length}</span>{" "}
						rooms in the directory
					</p>

					<span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm text-second">
						<span className="h-2 w-2 rounded-full bg-success" />
						<span className="font-semibold text-text">{activeRooms}</span>
						currently active
					</span>
				</div>

				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{rooms.map((room) => (
						<article
							key={room.id}
							className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-main/50 hover:shadow-xl hover:shadow-main/5"
						>
							<div className="mb-5 flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="text-xs font-medium uppercase tracking-wider text-second">
										Room #{room.id}
									</p>
									<h2 className="mt-2 break-words text-xl font-semibold text-text transition group-hover:text-blue-300">
										{room.name}
									</h2>
								</div>

								<span
									className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${room.isActive
										? "border-success/20 bg-success/10 text-success"
										: "border-border bg-background text-second"
										}`}
								>
									{room.isActive ? "Active" : "Inactive"}
								</span>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="rounded-xl border border-border bg-background/70 p-3">
									<p className="text-xs text-second">Capacity</p>
									<p className="mt-1 font-semibold text-text">
										{room.capacity} people
									</p>
								</div>

								<div className="rounded-xl border border-border bg-background/70 p-3">
									<p className="text-xs text-second">Location</p>
									<p className="mt-1 font-semibold text-text">
										Floor {room.floor}
									</p>
								</div>
							</div>

							<div className="mt-6 flex-1">
								<div className="flex items-center gap-2">
									<span className="h-5 w-1 rounded-full bg-violet" />
									<h3 className="text-sm font-semibold text-text">
										Equipment
									</h3>
								</div>

								<div className="mt-3 flex flex-wrap gap-2">
									{room.equipment.length > 0 ? (
										room.equipment.map((item) => (
											<span
												key={item}
												className="rounded-lg border border-violet/20 bg-violet/10 px-2.5 py-1.5 text-xs font-medium text-violet"
											>
												{item}
											</span>
										))
									) : (
										<span className="text-sm text-second">
											No equipment listed
										</span>
									)}
								</div>
							</div>
							<button
								onClick={() => handleBooking(room)}
								type="button"
								disabled={!room.isActive}
								className="mt-6 w-full rounded-xl bg-main px-4 py-3 font-semibold text-white shadow-md shadow-main/10 transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main disabled:cursor-not-allowed disabled:border disabled:border-border disabled:bg-background disabled:text-second disabled:shadow-none"
							>
								{room.isActive ? (
									<span className="inline-flex items-center justify-center gap-2">
										Book
									</span>
								) : (
									"Currently unavailable"
								)}
							</button>
						</article>
					))}
					{selectedRoom && userId && (
						<ReservationModal
							room={selectedRoom}
							userId={userId}
							onClose={() => {
								setSelectedRoom(null)
								loadRooms(false);
							}}
						/>
					)}
				</div>
			</div>
		</section>
	);
}
