import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Flat from '@/models/Flat';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const flat = await Flat.findById(params.id)
      .populate('lister', 'name email phone image role')
      .lean();

    if (!flat) {
      return NextResponse.json(
        { error: 'Flat not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await Flat.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    return NextResponse.json({ flat });
  } catch (error) {
    console.error('Get flat error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flat' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const flat = await Flat.findById(params.id);
    if (!flat) {
      return NextResponse.json(
        { error: 'Flat not found' },
        { status: 404 }
      );
    }

    // Check if user owns this flat or is admin
    if (flat.lister.toString() !== session.user.id && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const updateData = await request.json();

    // Remove fields that shouldn't be updated directly
    delete updateData.lister;
    delete updateData.listerType;
    delete updateData.views;
    delete updateData.createdAt;

    const updatedFlat = await Flat.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('lister', 'name email phone image');

    return NextResponse.json({
      message: 'Flat updated successfully',
      flat: updatedFlat,
    });
  } catch (error) {
    console.error('Update flat error:', error);
    return NextResponse.json(
      { error: 'Failed to update flat' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const flat = await Flat.findById(params.id);
    if (!flat) {
      return NextResponse.json(
        { error: 'Flat not found' },
        { status: 404 }
      );
    }

    // Check if user owns this flat or is admin
    if (flat.lister.toString() !== session.user.id && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await Flat.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'Flat deleted successfully',
    });
  } catch (error) {
    console.error('Delete flat error:', error);
    return NextResponse.json(
      { error: 'Failed to delete flat' },
      { status: 500 }
    );
  }
}
