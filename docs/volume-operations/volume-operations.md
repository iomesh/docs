---
id: volume-operations
title: Volume Operations
sidebar_label: Volume Operations
---

## Volume Operations

### Creating PV

To create a PV, you should first create a PVC. Once done, IOMesh will sense the creation of this PVC and automatically create a new PV based on the `spec` in it, binding them together. Then the pair of PV and PVC will be ready to use.

**Prerequisite**

Ensure that there is already a StorageClass available for use.

**Procedure**
1. Create and configure the YAML file.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: iomesh-example-pvc
    spec:
      storageClassName: iomesh-example-sc
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 10Gi
    ```
   For details, refer to Kubernetes documentation.
  
2. Run the following command to create a PVC.

   ```
   $ kubectl create -f pvc-1.yaml
   ```

3. Run the following command to check for results.

   ```
   $ kubectl get pvc pvc-1.yaml
   ```


### Expanding PV
To expand the capacity of a PV, you should modify its corresponding PVC. Once done, the newly generated PVs will be created with the new capacity. 

**Prerequisites**
- Volume expansion support for PVC is in Kubernetes 1.11 or above, which is already required in [Prerequisites](#prerequisites).
- The StorageClass must set `allowVolumeExpansion` to true. The default StorageClass `iomesh-csi-driver` already does this. If a StorageClass is created and configured with custom parameters, verify that its `allowVolumeExpansion` is set to "true". 


**Procedure**

1. Create and configure the YAML file. The following example assumes a PVC named `example-pvc` with a capacity of `10Gi`.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: example-pvc
    spec:
      storageClassName: iomesh-csi-driver-default
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 10Gi # The original capacity of the PVC.
    ```
2. Run the following command to apply the YAML file. 

   ```bash
   kubectl get pvc example-pvc
   ```
   After running the command, you should see an example like this:
   ```output
   NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
   example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   10Gi        RWO            iomesh-csi-driver-default   11m
   ```

3. Set the field `storage` to a new value.

   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
   name: example-pvc
    spec:
      storageClassName: iomesh-csi-driver-default
      accessModes:
        - ReadWriteOnce
    resources:
      requests:
        storage: 20Gi # Enter a new capacity value.
    ```

3. Run the following command to apply the new YAML file.

   ```bash
   kubectl apply -f example-pvc.yaml
   ```

4. Run the following command to check the capacity of the PVC.

   ```bash
   kubectl get pvc example-pvc 
   ```

   After running the command, you should see an example below:

   ```output
   NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
   example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi        RWO            iomesh-csi-driver-default   11m
   ```

5. Run the following command to check the PV capacity.
   ```bash
   kubectl get pv pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca 
   ```

   After running the command, you should see an example like this:
   ```output
   NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS
   pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi       Retain           Bound    default/example-pvc   iomesh-csi-driver-default
   ```

### Cloning PV
A clone is a duplicate of an existing volume in the system and data on the source will be duplicated to the destination. To clone a PV, you should specify an existing PVC in the field `dataSource` so that you can clone a volume based on it.

**Prerequisites**:
- The source PVC and the destination PVC must be in the same namespace.
- The source PVC and the destination PVC must have the same StorageClass and VolumeMode configurations.


**Procedure**
1. Create and configure the YAML file.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: cloned-pvc
    spec:
      storageClassName: iomesh-csi-driver-default
      dataSource:
        name: existing-pvc # The source PVC in the same namespace. 
        kind: PersistentVolumeClaim
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 5Gi # The capacity value must be the same or larger than that of the source volume.
      volumeMode: Block
    ```

2. Run the following command to apply the YAML file. Once done, a clone of `existing-pvc` will be created.

   ```bash
   kubectl apply -f example-clone.yaml
   ```
   
