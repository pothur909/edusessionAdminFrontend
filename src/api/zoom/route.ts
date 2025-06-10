// app/api/zoom/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ZOOM_SDK_KEY = "SPWx_1EZTASuQsz5Ubf_8A";
const ZOOM_SDK_SECRET = "BnDvY1DjJ9Ilt3jEPmR5uK9zMBtIM6ld";

export async function POST(request: Request) {
  try {
    console.log('=== Zoom Signature Generation Started ===');
    console.log('Environment check:', {
      hasSDKKey: !!ZOOM_SDK_KEY,
      hasSDKSecret: !!ZOOM_SDK_SECRET,
      sdkKeyPreview: ZOOM_SDK_KEY ? ZOOM_SDK_KEY.substring(0, 8) + '...' : 'Missing',
      nodeEnv: process.env.NODE_ENV
    });
    
    const { meetingNumber, role } = await request.json();
    console.log('Request data:', { meetingNumber, role, meetingNumberType: typeof meetingNumber });

    // Validate input
    if (!meetingNumber || role === undefined) {
      console.error('Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters: meetingNumber and role are required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) {
      console.error('Missing Zoom SDK credentials in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Zoom SDK credentials' },
        { status: 500 }
      );
    }

    // Ensure meetingNumber is a string and clean it
    const cleanMeetingNumber = meetingNumber.toString().replace(/\s/g, '');
    console.log('Cleaned meeting number:', cleanMeetingNumber);

    // Generate timestamps
    const iat = Math.round(new Date().getTime() / 1000) - 30; // 30 seconds ago
    const exp = iat + 60 * 60 * 2; // 2 hours from iat

    console.log('Timestamps:', { 
      iat, 
      exp, 
      currentTime: Math.round(new Date().getTime() / 1000),
      timeUntilExpiry: exp - Math.round(new Date().getTime() / 1000)
    });

    // JWT Header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    // JWT Payload - following Zoom's exact requirements
    const payload = {
      iss: ZOOM_SDK_KEY,
      alg: 'HS256',
      aud: 'zoom',
      iat: iat,
      exp: exp,
      appKey: ZOOM_SDK_KEY,
      tokenExp: exp,
      mn: cleanMeetingNumber,
      role: parseInt(role.toString())
    };

    console.log('JWT Payload structure:', {
      iss: payload.iss.substring(0, 8) + '...',
      alg: payload.alg,
      aud: payload.aud,
      iat: payload.iat,
      exp: payload.exp,
      appKey: payload.appKey.substring(0, 8) + '...',
      tokenExp: payload.tokenExp,
      mn: payload.mn,
      role: payload.role
    });

    // Base64URL encoding functions
    function base64urlEscape(str: string): string {
      return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    function base64urlEncode(obj: any): string {
      const jsonStr = JSON.stringify(obj);
      const base64 = Buffer.from(jsonStr).toString('base64');
      return base64urlEscape(base64);
    }

    // Create JWT components
    const encodedHeader = base64urlEncode(header);
    const encodedPayload = base64urlEncode(payload);
    
    console.log('JWT encoding:', {
      headerLength: encodedHeader.length,
      payloadLength: encodedPayload.length,
      headerPreview: encodedHeader.substring(0, 20) + '...',
      payloadPreview: encodedPayload.substring(0, 20) + '...'
    });

    // Create signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    console.log('Signature input length:', signatureInput.length);

    const signature = base64urlEscape(
      crypto
        .createHmac('sha256', ZOOM_SDK_SECRET)
        .update(signatureInput)
        .digest('base64')
    );

    console.log('Signature details:', {
      length: signature.length,
      preview: signature.substring(0, 20) + '...'
    });

    // Final JWT token
    const jwtToken = `${encodedHeader}.${encodedPayload}.${signature}`;
    
    console.log('Final JWT details:', {
      totalLength: jwtToken.length,
      parts: jwtToken.split('.').length,
      structure: {
        headerLength: encodedHeader.length,
        payloadLength: encodedPayload.length,
        signatureLength: signature.length
      }
    });

    // Validate JWT structure
    if (jwtToken.split('.').length !== 3) {
      throw new Error('Invalid JWT structure - must have exactly 3 parts');
    }

    console.log('=== Zoom Signature Generation Completed Successfully ===');

    const response = {
      signature: jwtToken,
      meetingNumber: cleanMeetingNumber,
      role: parseInt(role.toString()),
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          sdkKey: ZOOM_SDK_KEY.substring(0, 8) + '...',
          signatureLength: jwtToken.length,
          iat,
          exp,
          timeUntilExpiry: exp - Math.round(new Date().getTime() / 1000),
          structure: {
            header: encodedHeader.length,
            payload: encodedPayload.length, 
            signature: signature.length
          }
        }
      })
    };

    console.log('Returning response with signature length:', jwtToken.length);
    return NextResponse.json(response);

  } catch (error) {
    console.error('=== Zoom Signature Generation Failed ===');
    console.error('Error type:', typeof error);
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate signature',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}