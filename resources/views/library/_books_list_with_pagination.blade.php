<div class="books-count-container">
    {{ $books->total() }} books @if($books->hasPages()) - {{ $books->lastPage() }} pages @endif
</div>
<ul class="books-list">
    @each('library._books_list', $books, 'book')
</ul>
{{  $books->links() }}
