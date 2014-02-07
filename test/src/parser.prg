DEFINE CLASS Mop AS Custom

	cText = ""
	cPicto = ""

	* -- initialization
	PROCEDURE Init

		LPARAMETERS cAbrev, cLabel

		LOCAL nI
		LOCAL ARRAY aArray(1)

		FOR M.nI = 1 TO 4 STEP 1

		ENDFOR

	ENDPROC

	FUNCTION Get

		LPARAMETERS cAbrev

		LOCAL oDBF

		M.oDBF = CREATEOBJECT("OpenDBF")

		RETURN M.cAbrev

	ENDFUNC

ENDDEFINE