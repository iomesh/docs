---
id: expand-pv
title: Expand PV
sidebar_label: Expand PV
---

To expand the capacity of a PV, you only need to modify the field `storage` in the corresponding PVC.

**Prerequisite**

The StorageClass must set `allowVolumeExpansion` to true. The default StorageClass `iomesh-csi-driver` already does this. If a StorageClass is created and configured with custom parameters, verify that its `allowVolumeExpansion` is set to `true`. 

**Procedure**

The following example assumes a YAML config `pvc.yaml`, a PVC `example-pvc` with a capacity of `10Gi`.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: example-pvc
    spec:
      storageClassName: iomesh-csi-driver
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 10Gi # The original capacity of the PVC.
    ```

1. Get the PVC that you want to modify the storage capacity for.

    ```bash
    kubectl get pvc example-pvc
    ```

    After running the command, you should see an example like:

    ```output
    NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
    example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   10Gi        RWO            iomesh-csi-driver   11m
    ```

2. Set the field `storage` to a new value.
    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: example-pvc
    spec:
      storageClassName: iomesh-csi-driver
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 20Gi # Enter a new value greater than the original value.
    ```

3. Apply the modification.

    ```bash
    kubectl apply -f pvc.yaml
    ```

4. Verify that the PVC capacity is already expanded. 

    ```bash
    kubectl get pvc example-pvc 
    ```

    After running the command, you should see an example below and get the volume name.

    ```output
    NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
    example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi        RWO            iomesh-csi-driver   11m
    ```

5. Once the PVC modification is applied, the PV capacity will be expanded as well. Run the following command to see if the PV capacity is expanded as expected.
   
    ```bash
    kubectl get pv pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca # The PV name you get in Step 4.
    ```

    After running the command, you should see an example like this:
    ```output
    NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS
    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi       Retain           Bound    default/example-pvc   iomesh-csi-driver
    ```