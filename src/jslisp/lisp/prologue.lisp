(setg null-or-empty-list?
	(fn (a-list)
		(or (null? a-list)
			(and
				(and
					(cons? a-list)
					(null? (car a-list))
				)
				(null? (cdr a-list))
			)
		)
	))

(setg list
	(fn (*values)
		*values
	)
)

(setg eq
	(fn (a b)
		(cond
			((not (sym= (jstypeof a) (jstypeof b)))
				false)
			((cons? a)
				(listeq a b))
			((sym? a)
				(sym= a b))
			((dict.is? a)
				(dict.= a b))
			((num? a)
				(js= a b))
			((bool? a)
				(js= a b))
			((null? a)
				(js= a b))
  
			(true
				throw-cannotCompareUnknownTypes)
		)
	)
)

(setg listeq
	(fn (a b) 
		(if (eq (car a) (car b))
			(if(eq (cdr a) null)
				(eq (cdr b) null)
				(if (eq (cdr b) null)
					false
					(listeq (cdr a) (cdr b))
				)
			)
			false
		)
	)
)

