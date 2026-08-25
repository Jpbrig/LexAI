import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed";

export async function GET(req: NextRequest) {
  try {
    await seedDatabase();

    const user = await prisma.user.findFirst({
      where: { email: "teste@lexai.com.br" },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Erro ao carregar usuário:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao carregar configurações" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { name, email, oab, image } = await req.json();

    const user = await prisma.user.findFirst({
      where: { email: "teste@lexai.com.br" },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : user.name,
        email: email !== undefined ? email : user.email,
        oab: oab !== undefined ? oab : user.oab,
        image: image !== undefined ? image : user.image,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar dados" },
      { status: 500 }
    );
  }
}
