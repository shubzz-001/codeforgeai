// In this we are studying Arrays, Types of arrays : 1D array and 2D array
import java.util.*;

public class Main {

    // Find largest element in array

    public static int largestNo(int[] arr) {
        int largest = Integer.MIN_VALUE; // Lowest value in java
        for (int i = 0; i < arr.length; i++) {
            if (largest < arr[i]) {
                largest = arr[i];
            }
        }
        return largest;
    }

    // Reverse the array

    public static void reverseArr(int[] arr) {
        int start = 0; // first index of element
        int end = arr.length - 1; // last index of element in array

        while (start < end) {
            int temp = arr[end];
            arr[end] = arr[start];
            arr[start] = temp;

            start++;
            end--;
        }
    }

    // Make a pair of each element of array

    public static void makePair(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            int curr = arr[i];

            for (int j = i + 1; j < n; j++) {
                System.out.print("(" + curr + "," + arr[j] + ")");
            }
            System.out.println();
        }

    }

    // Print sub-array of Array

    public static void sub_Arr(int[] arr) {

        int ts = 0;

        for (int i = 0; i < arr.length; i++) {  // Starting of first element for sub-array
            int start = i;
            for (int j = i; j < arr.length; j++) { // for the deciding of last element of sub-array
                int end = j;
                for (int k = start; k <= end; k++) {  // printing sub-array
                    System.out.print(arr[k] + " ");
                }
                ts++;
                System.out.println();
            }
            System.out.println();
        }
        System.out.println("Total sub-arrays crated: " + ts);
    }

    // Find the sum of elements in sub-arrays

    public static void sum_of_subArr(int[] arr) {
        /*
        We need to create first sub-array &
        then need loop to add elements in that sub-array
        ...THIS FUNCTION IS CREATED BY MYSELF ON MY OWN UNDERSTANDING...
        */

        for (int i = 0; i < arr.length; i++) {
            int start = i;
            for (int j = i; j < arr.length; j++) {
                int end = j;
                int sum = 0;  // Declaring initial value for sum of sub_array

                for (int k = start; k <= end; k++) {

                    System.out.print(arr[k] + " ");  // Printing a Sub-array
                    sum = sum + arr[k]; // Adding elements of sub-array to sum
                }
                System.out.print("::Sum of this sub-array is: " + sum);
                System.out.println();
            }
            System.out.println();
        }
    }




    public static void main(String[] args) {

        // Array Create

        int[] marks = {2, 4, 6, 8, 10};

        // Find largest element in array
        // System.out.println(largestNo(marks));
        // reverseArr(marks);
        //
        // for ( int i=0; i<marks.length; i++){
        //     System.out.print(marks[i]+" ");
        // }
        // System.out.println();

        //makePair(marks);
        //sub_Arr(marks);
        sum_of_subArr(marks);



    }
}




