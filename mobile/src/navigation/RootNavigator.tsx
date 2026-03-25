// mobile/src/navigation/RootNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { FeedScreen }        from '../screens/FeedScreen';
import { AnnoncesScreen }    from '../screens/AnnoncesScreen';
import { BoutiqueScreen }    from '../screens/BoutiqueScreen';
import { MessagesScreen }    from '../screens/MessagesScreen';
import { ProfilScreen }      from '../screens/ProfilScreen';
import { TalentDetailScreen } from '../screens/TalentDetailScreen';
import { ProductScreen }     from '../screens/ProductScreen';
import { LoginScreen }       from '../screens/LoginScreen';
import { SOSScreen }         from '../screens/SOSScreen';
import { COLORS }            from '../theme';
import { useAuth }           from '../store/AuthContext';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.gold,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.dark2,
          borderTopColor:  COLORS.border,
          borderTopWidth:  0.5,
          height: 64,
          paddingBottom: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Feed:      focused ? 'musical-notes'   : 'musical-notes-outline',
            Annonces:  focused ? 'megaphone'        : 'megaphone-outline',
            Boutique:  focused ? 'bag'              : 'bag-outline',
            Messages:  focused ? 'chatbubbles'      : 'chatbubbles-outline',
            Profil:    focused ? 'person-circle'    : 'person-circle-outline',
          };
          return <Ionicons name={icons[route.name] as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed"     component={FeedScreen}     options={{ title: 'Talents' }} />
      <Tab.Screen name="Annonces" component={AnnoncesScreen} options={{ title: 'Missions' }} />
      <Tab.Screen name="Boutique" component={BoutiqueScreen} options={{ title: 'Boutique' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profil"   component={ProfilScreen}   />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.dark } }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main"         component={TabNavigator} />
          <Stack.Screen name="TalentDetail" component={TalentDetailScreen}
            options={{ presentation: 'modal', headerShown: true, title: '', headerStyle: { backgroundColor: COLORS.dark2 }, headerTintColor: COLORS.text }} />
          <Stack.Screen name="Product"      component={ProductScreen}
            options={{ presentation: 'modal', headerShown: true, title: '', headerStyle: { backgroundColor: COLORS.dark2 }, headerTintColor: COLORS.text }} />
          <Stack.Screen name="SOS"          component={SOSScreen}
            options={{ presentation: 'fullScreenModal', headerShown: true, title: '🚨 SOS Urgence', headerStyle: { backgroundColor: '#1a0505' }, headerTintColor: '#e05555' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
