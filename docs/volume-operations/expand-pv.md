---
id: expand-pv
title: Expanding PV
sidebar_label: Expanding PV
---

To expand the capacity of a PV, you should modify its corresponding PVC. Once done, new PVs based on this PVC  will be created with the new capacity. 

**Prerequisite**

The StorageClass must set `allowVolumeExpansion` to true. The default StorageClass `iomesh-csi-driver` already does this. If a StorageClass is created and configured with custom parameters, verify that its `allowVolumeExpansion` is set to "true". 


**Procedure**

The following example assumes a PVC named `example-pvc` with a capacity of `10Gi`.

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

1. Run the following command to get the PVC.

    ```bash
    kubectl get pvc example-pvc
    ```

    After running the command, you should see an example like:

    ```output
    NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
    example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   10Gi        RWO            iomesh-csi-driver-default   11m
    ```

2. Set the field `storage` to a new value.

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

6. Once the PVC modification is applied, a new PV will be created. Run the following command to check the capacity of the new PV.
   
    ```bash
    kubectl get pv pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca 
    ```

    After running the command, you should see an example like this:
    ```output
    NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS
    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi       Retain           Bound    default/example-pvc   iomesh-csi-driver-default
    ```