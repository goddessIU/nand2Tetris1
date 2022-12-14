// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// Put your code here.
(LOOP)
    @KBD 
    D=M 
    @BLACK 
    D; JNE
    @WHITE 
    D; JEQ
    @LOOP 
    0; JMP
(BLACK)
    @SCREEN 
    D=A 
    @addr 
    M=D 

    @256
    D=A
    @n 
    M=D

    @i 
    M=0

    (BLACKLOOP)
        @i 
        D=M 
        @n 
        D=D-M 
        @LOOP 
        D;JGE 

        @addr 
        A=M 
        M=-1

        @i 
        M=M+1

        @addr 
        M=M+1

        @BLACKLOOP 
        0; JMP
(WHITE)
    @SCREEN 
    D=A 
    @addr 
    M=D 

    @256
    D=A
    @n 
    M=D

    @i 
    M=0

    (WHITELOOP)
        @i 
        D=M 
        @n 
        D=D-M 
        @LOOP 
        D;JGE 

        @addr 
        A=M 
        M=0

        @i 
        M=M+1

        @addr 
        M=M+1

        @WHITELOOP 
        0; JMP
