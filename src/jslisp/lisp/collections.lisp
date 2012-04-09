(setg filter (fn (elts pred)
		(if (null-or-empty-list? elts)
			'()
		(do
			(setl curr-elt (car elts))
			(setl get-rest (fn ()
				(filter (cdr elts) pred)
			))
			(if (pred curr-elt)
				(cons curr-elt (get-rest))
				(get-rest)
			)
		))
	)
)

(setg map (fn (elts map-fn)
	(if (null-or-empty-list? elts)
		'()
	(cons
		(map-fn (car elts))
		(map (cdr elts) map-fn)
	))
))

(setg first-or-null
	(fn (elts filter-fn)
		(if (null-or-empty-list? elts)
			null
		(do
			(setl head (car elts))
			(if (filter-fn head)
				head
				(first-or-null
					(cdr elts)
					filter-fn))
		))
	)
)


(setg push
	(fn (a-list elt)
		(if (null? a-list)
			(cons elt)
			(cons 	(car a-list)
					(push (cdr a-list) elt))
		)
	)
)

(setg append
	(fn (list-1 list-2)
		(if (null-or-empty-list? list-1)
			list-2
			(cons
				(car list-1)
				(append (cdr list-1) list-2)
			)
		)
	))

(do
  (setl reverse-int
    (fn (a-list acc)
	  (if (null-or-empty-list? a-list)
        acc
		(reverse-int
		  (cdr a-list) 
		  (cons (car a-list) acc)
		)
      )
    )
  )
  (setg reverse
    (fn (a-list)
      (reverse-int a-list '())
	) 
  )
)


(setg partition
	(fn (a-list set1-predicate)
		(setl set2-predicate
			(fn (elt) (not (set1-predicate elt))))

		(setl set1
			(filter a-list set1-predicate))
		(setl set2
			(filter a-list set2-predicate))

		(list set1 set2)
	))

(setg second
  (fn (a-list)
    (car (cdr a-list))
  ))
