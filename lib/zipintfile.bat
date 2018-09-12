PATH %PATH%;C:\Program Files\7-Zip;
set folder=%1
7z a -r ..\data\requests\%folder%.zip ..\data\requests\%folder%\*.*
rmdir ..\data\requests\%folder% /s /q