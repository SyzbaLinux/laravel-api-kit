import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Country, State, City } from '../models/location.models';

@Injectable({ providedIn: 'root' })
export class LocationService {
    private readonly http = inject(HttpClient);
    private readonly base = `${environment.apiUrl}/locations`;

    readonly countries = signal<Country[]>([]);
    readonly states = signal<State[]>([]);
    readonly cities = signal<City[]>([]);

    readonly countriesLoading = signal(false);
    readonly statesLoading = signal(false);
    readonly citiesLoading = signal(false);

    loadCountries(): void {
        if (this.countries().length) return; // already loaded
        this.countriesLoading.set(true);
        this.http.get<{ data: Country[] }>(`${this.base}/countries`).subscribe({
            next: (res) => {
                this.countries.set(res.data);
                this.countriesLoading.set(false);
            },
            error: () => this.countriesLoading.set(false),
        });
    }

    loadStates(countryId: number): void {
        this.states.set([]);
        this.cities.set([]);
        this.statesLoading.set(true);
        this.http.get<{ data: State[] }>(`${this.base}/countries/${countryId}/states`).subscribe({
            next: (res) => {
                this.states.set(res.data);
                this.statesLoading.set(false);
            },
            error: () => this.statesLoading.set(false),
        });
    }

    loadCities(stateId: number): void {
        this.cities.set([]);
        this.citiesLoading.set(true);
        this.http.get<{ data: City[] }>(`${this.base}/states/${stateId}/cities`).subscribe({
            next: (res) => {
                this.cities.set(res.data);
                this.citiesLoading.set(false);
            },
            error: () => this.citiesLoading.set(false),
        });
    }

    clearStates(): void {
        this.states.set([]);
        this.cities.set([]);
    }

    clearCities(): void {
        this.cities.set([]);
    }
}
