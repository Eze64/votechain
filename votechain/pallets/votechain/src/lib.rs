#![cfg_attr(not(feature = "std"), no_std)]

/// Edit this file to define custom logic or remove it if it is not needed.
/// Learn more about FRAME and the core library of Substrate FRAME pallets:
/// <https://docs.substrate.io/v3/runtime/frame>

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

#[frame_support::pallet]
pub mod pallet {
	use frame_support::{
		inherent::Vec, pallet_prelude::*, sp_runtime::traits::Hash, traits::Currency, transactional,
	};
	use frame_system::pallet_prelude::*;

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config {
		/// Because this pallet emits events, it depends on the runtime's definition of an event.
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;

		type Currency: Currency<Self::AccountId>;

		#[pallet::constant]
		type ElectionMinBytes: Get<u32>;
		#[pallet::constant]
		type ElectionMaxBytes: Get<u32>;
		#[pallet::constant]
		type CandidateMinBytes: Get<u32>;
		#[pallet::constant]
		type CandidateMaxBytes: Get<u32>;
	}

	#[derive(Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
	#[scale_info(skip_type_params(T))]
	pub struct Election {
		pub description: Vec<u8>,
		pub is_open: bool,
	}

	#[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
	#[scale_info(skip_type_params(T))]
	pub struct Candidate<T: Config> {
		pub candidate_name: Vec<u8>,
		pub election_id: T::Hash,
	}

	#[derive(Clone, Encode, Decode, PartialEq, RuntimeDebug, TypeInfo)]
	#[scale_info(skip_type_params(T))]
	pub struct Vote<T: Config> {
		pub candidate_id: T::Hash,
		pub election_id: T::Hash,
		pub author: <T as frame_system::Config>::AccountId,
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	#[pallet::without_storage_info]
	pub struct Pallet<T>(_);

	// The pallet's runtime storage items.
	// https://docs.substrate.io/v3/runtime/storage
	#[pallet::storage]
	#[pallet::getter(fn something)]
	// Learn more about declaring storage items:
	// https://docs.substrate.io/v3/runtime/storage#declaring-storage-items
	pub type Something<T> = StorageValue<_, u32>;

	#[pallet::storage]
	#[pallet::getter(fn elections)]
	pub(super) type Elections<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Election>;

	#[pallet::storage]
	#[pallet::getter(fn election_candidates)]
	pub(super) type ElectionCandidates<T: Config> =
		StorageMap<_, Twox64Concat, T::Hash, Vec<Candidate<T>>>;

	#[pallet::storage]
	#[pallet::getter(fn election_votes)]
	pub(super) type ElectionVotes<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Vec<Vote<T>>>;

	#[pallet::storage]
	#[pallet::getter(fn candidates)]
	pub(super) type Candidates<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Candidate<T>>;

	#[pallet::storage]
	#[pallet::getter(fn candidate_votes)]
	pub(super) type CandidateVotes<T: Config> = StorageMap<_, Twox64Concat, T::Hash, Vec<Vote<T>>>;

	// Pallets use events to inform users when important changes are made.
	// https://docs.substrate.io/v3/runtime/events-and-errors
	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		/// Event documentation should end with an array that provides descriptive names for event
		/// parameters. [something, who]
		SomethingStored(u32, T::AccountId),
		ElectionStored(Vec<u8>, T::Hash),
		ElectionUpdated(bool, T::Hash),
		CandidateStored(Vec<u8>, T::Hash),
		VoteStored(T::Hash, T::Hash),
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		/// Error names should be descriptive.
		NoneValue,
		/// Errors should have helpful documentation associated with them.
		StorageOverflow,
		ElectionNotEnoughBytes,
		ElectionTooManyBytes,
		CandidateNotEnoughBytes,
		CandidateTooManyBytes,
		ElectionNotFound,
		CandidateNotFound,
		OriginNotSudo,
	}

	// Dispatchable functions allows users to interact with the pallet and invoke state changes.
	// These functions materialize as "extrinsics", which are often compared to transactions.
	// Dispatchable functions must be annotated with a weight and must return a DispatchResult.
	#[pallet::call]
	impl<T: Config> Pallet<T> {
		/// An example dispatchable that takes a singles value as a parameter, writes the value to
		/// storage and emits an event. This function must be dispatched by a signed extrinsic.
		#[pallet::weight(10_000 + T::DbWeight::get().writes(1))]
		pub fn do_something(origin: OriginFor<T>, something: u32) -> DispatchResult {
			// Check that the extrinsic was signed and get the signer.
			// This function will return an error if the extrinsic is not signed.
			// https://docs.substrate.io/v3/runtime/origins
			let who = ensure_signed(origin)?;

			// Update storage.
			<Something<T>>::put(something);

			// Emit an event.
			Self::deposit_event(Event::SomethingStored(something, who));
			// Return a successful DispatchResultWithPostInfo
			Ok(())
		}

		/// An example dispatchable that may throw a custom error.
		#[pallet::weight(10_000 + T::DbWeight::get().reads_writes(1,1))]
		pub fn cause_error(origin: OriginFor<T>) -> DispatchResult {
			let _who = ensure_signed(origin)?;

			// Read a value from storage.
			match <Something<T>>::get() {
				// Return an error if the value has not been set.
				None => Err(Error::<T>::NoneValue)?,
				Some(old) => {
					// Increment the value read from storage; will error in the event of overflow.
					let new = old.checked_add(1).ok_or(Error::<T>::StorageOverflow)?;
					// Update the value in storage with the incremented result.
					<Something<T>>::put(new);
					Ok(())
				}
			}
		}

		#[pallet::weight(10_000)]
		#[transactional]
		pub fn create_election(
			origin: OriginFor<T>,
			description: Vec<u8>,
		) -> DispatchResult {
			ensure_root(origin)?;

			ensure!(
				(description.len() as u32) > T::ElectionMinBytes::get(),
				<Error<T>>::ElectionNotEnoughBytes
			);

			ensure!(
				(description.len() as u32) < T::ElectionMaxBytes::get(),
				<Error<T>>::ElectionTooManyBytes
			);

			let election = Election {
				description: description.clone(),
				is_open: true,
			};

			let election_id = T::Hashing::hash_of(&election);
			<Elections<T>>::insert(election_id, election);

			let election_candidates_vec: Vec<Candidate<T>> = Vec::new();
			<ElectionCandidates<T>>::insert(election_id, election_candidates_vec);

			let election_votes_vec: Vec<Vote<T>> = Vec::new();
			<ElectionVotes<T>>::insert(election_id, election_votes_vec);

			Self::deposit_event(Event::ElectionStored(description, election_id));

			Ok(())
		}

		#[pallet::weight(5_000)]
		pub fn close_election(
			origin: OriginFor<T>,
			election_id: T::Hash,
		) -> DispatchResult {
			ensure_root(origin)?;

			let is_open = false;

			<Elections<T>>::mutate(election_id, |elections| match elections {
				None => Err(()),
				Some(election) => {
					if election.is_open {
						election.is_open = is_open;
						Ok(())
					} else {
						Err(())
					}
				}
			})
			.map_err(|_| <Error<T>>::ElectionNotFound)?;

			Self::deposit_event(Event::ElectionUpdated(is_open, election_id));
			Ok(())
		}

		#[pallet::weight(5_000)]
		pub fn create_candidate(
			origin: OriginFor<T>,
			candidate_name: Vec<u8>,
			election_id: T::Hash,
		) -> DispatchResult {
			ensure_root(origin)?;

			ensure!(
				(candidate_name.len() as u32) > T::CandidateMinBytes::get(),
				<Error<T>>::CandidateNotEnoughBytes
			);
			ensure!(
				(candidate_name.len() as u32) < T::CandidateMaxBytes::get(),
				<Error<T>>::CandidateTooManyBytes
			);
			let candidate = Candidate {
				candidate_name: candidate_name.clone(),
				election_id: election_id.clone(),
			};
			let candidate_id = T::Hashing::hash_of(&candidate);
			let candidate_votes_vec: Vec<Vote<T>> = Vec::new();

			<ElectionCandidates<T>>::mutate(election_id, |election_candidates| {
				match election_candidates {
					None => Err(()),
					Some(vec) => {
						vec.push(candidate.clone());

						<Candidates<T>>::insert(candidate_id, candidate);
						<CandidateVotes<T>>::insert(candidate_id, candidate_votes_vec);

						Ok(())
					}
				}
			})
			.map_err(|_| <Error<T>>::ElectionNotFound)?;

			Self::deposit_event(Event::CandidateStored(candidate_name, candidate_id));
			Ok(())
		}

		#[pallet::weight(5_000)]
		pub fn create_vote(
			origin: OriginFor<T>,
			candidate_id: T::Hash,
			election_id: T::Hash,
		) -> DispatchResult {

			let vote_author = ensure_signed(origin)?;

			let vote = Vote {
				author: vote_author.clone(),
				candidate_id: candidate_id.clone(),
				election_id: election_id.clone(),
			};

			<Elections<T>>::mutate(election_id, |elections| match elections {
				None => Err(()),
				Some(election) => {
					if election.is_open {
						Ok(())
					} else {
						Err(())
					}
				}
			})
			.map_err(|_| <Error<T>>::ElectionNotFound)?;

			<ElectionVotes<T>>::mutate(election_id, |election_votes| match election_votes {
				None => Err(()),
				Some(vec) => {
					let mut vote_exists: bool = false;

					for x in vec.clone() {
						if x.author == vote_author {
							vote_exists = true;
						}
					}

					if vote_exists {
						Err(())
					} else {
						vec.push(vote.clone());
						Ok(())
					}
				}
			})
			.map_err(|_| <Error<T>>::ElectionNotFound)?;

			<CandidateVotes<T>>::mutate(candidate_id, |candidate_votes| match candidate_votes {
				None => Err(()),
				Some(vec) => {
					vec.push(vote);
					Ok(())
				}
			})
			.map_err(|_| <Error<T>>::CandidateNotFound)?;

			Self::deposit_event(Event::VoteStored(election_id, candidate_id));
			Ok(())
		}
	}
}
