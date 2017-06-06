type TParticipants = (TIdParticipant | TParticipant)[];

type TIdParticipant = { id: string; };

type TParticipant = {
  firstName: string;
  lastName: string;
};

type TTour = {
  id: string;
  name: string;
  points: 15 | 20 | 40 | 80 | 150;
  elevation: number;
  distance: number;
  participants: TParticipants;
  user: string;
  createdAt: string;
  updatedAt: string;
};