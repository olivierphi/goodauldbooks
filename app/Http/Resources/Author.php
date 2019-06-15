<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Author extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->public_id,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'birthYear' => $this->birth_year,
            'deathYear' => $this->death_year,
        ];
    }
}
