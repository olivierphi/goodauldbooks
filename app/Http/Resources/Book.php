<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Book extends JsonResource
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
            'title' => $this->title,
            'lang' => $this->lang,
            'slug' => $this->slug,
            'url' => \route('books.show', ['slug' => $this->slug]),
            'authors' => Author::collection($this->whenLoaded('authors')),
        ];
    }
}
