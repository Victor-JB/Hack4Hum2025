import React, { useEffect, useState } from "react";
import { ScrollView, SafeAreaView, View, Pressable, Animated } from "react-native";
import { TextInput, Button, Text, SegmentedButtons, useTheme } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import { updateUserField, getUserProfile } from "../mainService";

const schools = [
    { label: "Santa Clara University", value: "Santa Clara University" },
    { label: "San Jose State University", value: "San Jose State University" },
    { label: "University Of California, San Diego", value: "University Of California, San Diego" },

    { label: "University Of California, Santa Barbara", value: "University Of California, Santa Barbara" },
    { label: "University Of California, Los Angeles", value: "University Of California, Los Angeles" },
    { label: "University Of California, Irvine", value: "University Of California, Irvine" },
    { label: "University Of California, Davis", value: "University Of California, Davis" },
    { label: "University Of California, Berkeley", value: "University Of California, Berkeley" },
    { label: "University Of California, Santa Cruz", value: "University Of California, Santa Cruz" },
    { label: "University Of California, San Francisco", value: "University Of California, San Francisco" },
    { label: "University Of California, Riverside", value: "University Of California, Riverside" },
    { label: "University Of California, Merced", value: "University Of California, Merced" },
];

const SettingsScreen: React.FC = () => {
    const theme = useTheme();
    const [open, setOpen] = useState(false); // Controls dropdown visibility
    const [schoolOptions, setSchoolOptions] = useState(schools);
    const [firstName, setFirstName] = useState("FIRST");
    const [lastName, setLastName] = useState("LAST");
    const [unit, setUnit] = useState<"metric" | "imperial">("metric");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [sex, setSex] = useState<"male" | "female">("male");
    const [dietaryGoals, setDietaryGoals] = useState("");
    const [school, setSchool] = useState("");

    const toggleAnim = new Animated.Value(sex === "male" ? 0 : 1);

    const toggleSex = () => {
        const newSex = sex === "male" ? "female" : "male";
        setSex(newSex);
        Animated.timing(toggleAnim, {
            toValue: newSex === "male" ? 0 : 1,
            duration: 200,
            useNativeDriver: false
        }).start();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={{ padding: 20 }} style={{marginBottom: 60}}>
                <Text variant="titleLarge">Settings</Text>

                <Text variant="titleMedium" style={{ marginTop: 20 }}>Name</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <TextInput
                        label={`First Name`}
                        value={firstName}
                        onChangeText={setFirstName}
                        keyboardType="default"
                        mode="outlined"
                        style={{ flex: 1, marginRight: 5,backgroundColor: theme.colors.surface }}
                    />
                    <TextInput
                        label={`Last Name`}
                        value={lastName}
                        onChangeText={setLastName}
                        keyboardType="default"
                        mode="outlined"
                        style={{ flex: 1, marginLeft: 5, backgroundColor: theme.colors.surface }}
                    />
                </View>

                <Text variant="titleMedium" style={{ marginTop: 20 }}>Select School</Text>
                <DropDownPicker
                    open={open}
                    value={school}
                    items={schoolOptions}
                    setOpen={setOpen}
                    setValue={setSchool}
                    setItems={setSchoolOptions}
                    style={{ marginTop: 10, backgroundColor: theme.colors.surface }}
                    dropDownContainerStyle={{ backgroundColor: theme.colors.surface }}
                />

                <Text variant="titleMedium" style={{ marginTop: 20 }}>Units</Text>
                <SegmentedButtons
                    value={unit}
                    onValueChange={(value) => setUnit(value as "metric" | "imperial")}
                    buttons={[
                        { value: "metric", label: "Metric (kg/cm)" },
                        { value: "imperial", label: "Imperial (lb/in)" }
                    ]}
                />

                <View style={{marginTop: 20, flexDirection: 'row', alignContent: 'center', alignItems: 'center', justifyContent: 'space-between'}}>
                    <View style={{flex: 1, marginRight: 5}}>
                        <Text variant="titleMedium">Height ({unit === "metric" ? "cm" : "in"})</Text>
                        <TextInput
                            label={`Height (${unit === "metric" ? "cm" : "in"})`}
                            value={height}
                            onChangeText={setHeight}
                            keyboardType="numeric"
                            mode="outlined"
                            style={{ backgroundColor: theme.colors.surface, flex: 1 }}
                        />
                    </View>
                    <View style={{flex: 1, marginLeft: 5}}>
                        <Text variant="titleMedium">Weight ({unit === "metric" ? "kg" : "lb"})</Text>
                        <TextInput
                            label={`Weight (${unit === "metric" ? "kg" : "lb"})`}
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="numeric"
                            mode="outlined"
                            style={{ backgroundColor: theme.colors.surface, flex: 1 }}
                        />
                    </View>
                </View>
                <Text variant="titleMedium" style={{ marginTop: 20 }}>Sex</Text>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, width: "100%" }}>
                    <Text 
                        variant="bodyLarge" 
                        style={{ 
                            fontWeight: sex === "male" ? "bold" : "normal", 
                            color: sex === "male" ? "skyblue" : "black",
                            minWidth: 65,
                            textAlign: "center"
                        }}
                    >
                        Male
                    </Text>
                    <Pressable 
                        onPress={toggleSex} 
                        style={{
                            width: 60, 
                            height: 30, 
                            borderRadius: 15, 
                            backgroundColor: sex === "male" ? "skyblue" : "pink", 
                            justifyContent: "center",
                            alignItems: "center",
                            paddingHorizontal: 2
                        }}
                    >
                        <Animated.View
                            style={{
                                width: 26,
                                height: 26,
                                borderRadius: 13,
                                backgroundColor: "white",
                                position: "absolute",
                                left: 2,
                                transform: [{
                                    translateX: toggleAnim.interpolate({
                                        inputRange: [0, 1], 
                                        outputRange: [0, 30]
                                    })
                                }]
                            }}
                        />
                    </Pressable>
                    <Text 
                        variant="bodyLarge" 
                        style={{ 
                            fontWeight: sex === "female" ? "bold" : "normal", 
                            color: sex === "female" ? "pink" : "black",
                            minWidth: 65,
                            textAlign: "center"
                        }}
                    >
                        Female
                    </Text>
                </View>

                <Text variant="titleMedium" style={{ marginTop: 20 }}>Additional Information</Text>
                <TextInput
                    label="Enter dietary restrictions, eating and health goals..."
                    value={dietaryGoals}
                    onChangeText={setDietaryGoals}
                    multiline
                    numberOfLines={4}
                    mode="outlined"
                    style={{ backgroundColor: theme.colors.surface, height: 100 }}
                />
            </ScrollView>

            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: theme.colors.surface }}>
                <Button mode="contained" onPress={() => {
                    console.log("REQUESTING UPDATE");
                    updateUserField({
                        sex: sex,
                        unit: unit,
                        firstName: firstName,
                        lastName: lastName,
                        dietaryGoals: dietaryGoals,
                        school: school,
                        height: height,
                        weight: weight,
                    });
                    console.log("Settings Saved");
                }}>
                    Save Changes
                </Button>
            </View>
        </SafeAreaView>
    );
};

export default SettingsScreen;
