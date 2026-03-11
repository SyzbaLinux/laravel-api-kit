export interface Country {
    id: number;
    name: string;
    iso: string;
}

export interface State {
    id: number;
    name: string;
    country_id: number;
}

export interface City {
    id: number;
    name: string;
    state_id: number;
}
