(do
	(setg record?
		(func (rec)
			(and
				(and
					(cons? rec)
					(sym? (car rec))
				)
				(sym= (car rec) 'record)
			)
		))


	(setg new
		(func (type-name *rest)
			(if (not (type-exists type-name))
				throwTypeDoesNotExistException)

			(setl rec (new-record-internal type-name (ListDict.new)))

			(setl optional-field-values (car *rest))

			(if (not (null? optional-field-values))
				(with-values rec optional-field-values)
				rec
			)
		)
	)

	(setl new-record-internal
		(func (type-name fields)
			(if (not (ListDict.is? fields))
				throw-fieldsMustBeAListDict)
			(list
				'record
				type-name
				fields
			)
		))

	(setl get-record-type-name
		(func (rec)
			(car (cdr rec))
		))

	(setg get-type-name
		(func (obj)
			(setl jstype (jstypeof obj))

			(cond
				((record? obj)
					(get-record-type-name obj))
				((null? obj) 'null)
				((ListDict.is? obj)				'dict)
				((sym= jstype 'number) 			'number)
				((sym= jstype 'LispExpression) 	'list)
				((sym= jstype 'LispSymbol) 		'symbol)
				((sym= jstype 'boolean) 		'bool)
				((sym= jstype 'LispMacro) 		'macro)
				((sym= jstype 'LispKeyword) 	'keyword)
				((sym= jstype 'LispFunction) 	'func)
				((sym= jstype 'string) 			'string)
				(true throwObjectNotOfRecognisedTypeException)
			)
		))

	(setl get-fields
		(func (rec)
			(if (not (record? rec))
				throwNotARecordException)

			(car (cdr (cdr rec)))
		))
			
	(setg get-type
		(func (type-name)
			(setl the-type
				(first-or-null
					types
					(func (type-rec)
						(eq (get-value type-rec 'name)
							type-name))
				))
			the-type
		))

	(setg type-exists
		(func (type-name)
			(setl the-type (get-type type-name))
			(not (null? the-type))
		))

	(setg type-of
		(func (rec)
			(setl type-name (get-type-name rec))
			(setl rec-type (get-type type-name))

			(if (null? rec-type)
				throwCouldntFindTypeForRecord)
			rec-type
		))

	(setg get-type-fields
		(func (type)
			(setl type-fields (get-value type 'fields))
			(map type-fields
				(func (field)
					(list
						(get-value field 'type)
						(get-value field 'name)
					)
				)
			)
		))

	(setg is-a
		(func (rec type-name)
			(setl rec-type-name (get-type-name rec))
			(sym= rec-type-name type-name)
		))

	(setg get-value
		(func (rec field-name)
			(setl field (get-field rec field-name))
			(car (cdr field))
		))

	(setl get-field
		(func (rec field-name)
			(setl field-values (get-fields rec))
			(ListDict.get field-values field-name)
		))
	

	(setg new-type
		(func (type-name *fields)
			(new-record-internal
				'type
				(ListDict.new
				  	(list
				 		(list 'name (list 'symbol type-name))
						(list 'fields (list 'list *fields))
					)
				)
			)
		))

	(setg new-field
		(func (field-name field-type)
			(new-record-internal
				'field
				(ListDict.new
					(list
						(list 'name (list 'symbol field-name))
						(list 'type (list 'symbol field-type))
					)
				)
			)
		))

	(setl type-of-type
		(new-type
			'type
			(new-field 'name 'symbol)
			(new-field 'fields 'list)
		))

	(setl type-of-field
		(new-type
			'field
			(new-field 'name 'symbol)
			(new-field 'type 'symbol)
		))

	(setg types
		(list
			type-of-type
			type-of-field

			(new-type 'number	)
			(new-type 'list		)
			(new-type 'symbol	)
			(new-type 'bool		)
			(new-type 'null		)
			(new-type 'macro	)
			(new-type 'keyword	)
			(new-type 'func		)
			(new-type 'string	)
		)
	)
	(do
	  	(setg with-values (func (rec field-values)
			(cond
				((null? field-values)
				rec)
				(true (do
					(setl rec-one-changed
						(with-value rec (car field-values)))

				  	(with-values
						rec-one-changed
						(cdr field-values))
				))
			)
		))
		(setl with-value
			(func (rec field)
				(if (not (record? rec))
					throwNotARecordException)

				(setl field-name (car field))
				(setl field-type (car (cdr field)))
				(setl field-value (car (cdr (cdr field))))
				
				(if (not (null? (cdr (cdr (cdr field)))))
					throwTooManyValuesInFieldException)
				(if (not (sym? field-name))
					throwFirstElementInFieldMustBeSymbolForFieldName)
				(if (not (sym? field-type))
					throwSecondElementInFieldMustBeSymbolForTypeName)

				(setl record-fields (get-fields rec))
				(setl type-name (get-type-name rec))
			
				(setl new-record-fields
					(ListDict.with-value
					    record-fields
						field-name
						(cdr field)))
				
				(new-record-internal
					type-name
					new-record-fields)
			)
		)
	)
)
